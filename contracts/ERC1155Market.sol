// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ERC1155lazy.sol";

contract FixedPriceMarketPlace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter internal _itemIds;
    Counters.Counter internal _itemsSold;

    ERC1155lazy internal ERC1155lazyContract;
    uint8 internal marketPlaceShare;

    mapping(uint256 => MarketItem) internal idToMarketItem;

    // -STORAGE -------------------------------------------------

    // +STRUCTS -------------------------------------------------
    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool sold;
        bool isActive;
        uint256 amount;
    }
    // +EVENTS --------------------------------------------------
    event MoneyTransferred(address from, address to, uint256 amount);
    event NFTTransferred(
        address from,
        address to,
        uint256 tokenId,
        uint256 amount
    );
    event MarketItemCreated(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        uint256 timestamp
    );
    event MarketItemSold(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 amount
    );
    event MarketItemPriceChanged(uint256 itemId, uint256 newPrice);

    // -EVENTS --------------------------------------------------

    constructor() {}

    function initToken(
        address _NFTationContract,
        uint8 marketPlaceSharePercentage
    ) public onlyOwner {
        ERC1155lazyContract = ERC1155lazy(_NFTationContract);
        marketPlaceShare = marketPlaceSharePercentage;
    }

    function changeMarketPlaceShare(uint8 _marketPlaceShare)
        external
        onlyOwner
    {
        marketPlaceShare = _marketPlaceShare;
    }

    function getMarketShareAndRoyalty(uint256 tokenId, uint256 price)
        private
        view
        returns (
            uint256 marketShareAmount,
            uint256 royaltyAmount,
            address creator
        )
    {
        marketShareAmount = ((marketPlaceShare * price) / 100);
        (creator, royaltyAmount) = ERC1155lazyContract.royaltyInfo(
            tokenId,
            price
        );
        return (marketShareAmount, royaltyAmount, creator);
    }

    function getMarketItemPrice(uint256 _marketItemId)
        public
        view
        returns (uint256)
    {
        return idToMarketItem[_marketItemId].price;
    }

    function createMarketItem(
        uint256 tokenId,
        uint256 price,
        uint256 amount,
        bytes memory data
    ) public payable nonReentrant returns (uint256) {
        require(price > 0, "price must be greater than 0");
        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        idToMarketItem[itemId] = MarketItem(
            itemId,
            tokenId,
            payable(msg.sender),
            price,
            false,
            true,
            amount
        );

        //external call
        ERC1155lazyContract.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            amount,
            data
        );

        emit MarketItemCreated(
            itemId,
            tokenId,
            msg.sender,
            price,
            block.timestamp
        );
        return itemId;
    }

    function changeMarketItemPrice(uint256 _itemId, uint256 _newPrice) public {
        MarketItem storage _marketItem = idToMarketItem[_itemId];
        require(_marketItem.isActive, "Invalid market item");
        require(
            msg.sender == _marketItem.seller,
            "Only seller can change price"
        );

        _marketItem.price = _newPrice;

        emit MarketItemPriceChanged(_itemId, _newPrice);
    }

    function createMarketSale(
        uint256 itemId,
        uint256 amount,
        bytes memory data
    ) public payable nonReentrant {
        MarketItem storage marketItem = idToMarketItem[itemId];

        uint256 price = marketItem.price * amount;
        uint256 _tokenId = marketItem.tokenId;
        uint256 amountleft = marketItem.amount - amount;

        require(msg.value == price, "You should include the price of the item");
        require(amountleft >= 0, "supply not enough");

        require(
            msg.sender != marketItem.seller,
            "seller can not buy its owned token"
        );

        (
            uint256 marketPlaceShareAmount,
            uint256 royaltyAmount,
            address tokenCreator
        ) = getMarketShareAndRoyalty(_tokenId, price);

        if (amountleft == 0) {
            marketItem.sold = true;
            marketItem.isActive = false;
            _itemsSold.increment();
        } else {
            marketItem.sold = false;
            marketItem.isActive = true;
        }

        marketItem.sold = true;
        marketItem.isActive = false;
        _itemsSold.increment();

        //External call

        //payable(owner()).transfer(marketPlaceShareAmount);
        bool sent;
        (sent, ) = payable(owner()).call{value: marketPlaceShareAmount}("");
        require(sent);

        if (royaltyAmount > 0) {
            (sent, ) = payable(tokenCreator).call{value: royaltyAmount}("");
            require(sent);
            //payable(tokenCreator).transfer(royaltyAmount);
        }

        uint256 remaining = (price - (marketPlaceShareAmount)) -
            (royaltyAmount);

        //marketItem.seller.transfer(remaining);
        (sent, ) = payable(marketItem.seller).call{value: remaining}("");
        require(sent);

        ERC1155lazyContract.safeTransferFrom(
            address(this),
            msg.sender,
            _tokenId,
            amount,
            data
        );

        emit MoneyTransferred(msg.sender, marketItem.seller, remaining);
        emit NFTTransferred(address(this), msg.sender, _tokenId, amount);
        emit MarketItemSold(
            itemId,
            _tokenId,
            marketItem.seller,
            msg.sender,
            amount
        );
    }
}
