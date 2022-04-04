// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NewERC1155Lazy.sol";

contract NewERC1155Market is ERC1155Holder, ReentrancyGuard, Ownable, EIP712 {
    using Counters for Counters.Counter;

    Counters.Counter internal _itemIds;
    Counters.Counter internal _itemsSold;

    NewERC1155Lazy internal ERC1155LazyContract;
    uint8 internal marketPlaceShare;

    mapping(uint256 => MarketItem) internal idToMarketItem;

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool sold;
        bool isActive;
        uint256 amount;
    }

    string public name;
    string public symbol;
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

    constructor() EIP712("Name", "1.0.0") {
        name = "nft";
        symbol = "nft";
    }

    function changeMarketPlaceShare(uint8 _marketPlaceShare)
        external
        onlyOwner
    {
        marketPlaceShare = _marketPlaceShare;
    }

    function buyLazyItem(
        NewERC1155Lazy.NFTVoucher calldata voucher,
        bytes memory signature,
        uint256 amount
    ) external payable {
        (uint256 id, address signer) = ERC1155LazyContract
            .mintAndTransferMarket(voucher, signature);
        uint256 Id = createMarketItemlazy(
            id,
            voucher.minPrice,
            voucher.amount,
            signer
        );
        createMarketSale(Id, amount);
    }

    function initToken(
        address _NFTationContract,
        uint8 marketPlaceSharePercentage
    ) public onlyOwner {
        ERC1155LazyContract = NewERC1155Lazy(_NFTationContract);
        marketPlaceShare = marketPlaceSharePercentage;
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
        uint256 amount
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
        ERC1155LazyContract.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            amount,
            ""
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

    function createMarketItemlazy(
        uint256 tokenId,
        uint256 price,
        uint256 amount,
        address seller
    ) public payable nonReentrant returns (uint256) {
        require(price > 0, "price must be greater than 0");
        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        idToMarketItem[itemId] = MarketItem(
            itemId,
            tokenId,
            payable(seller),
            price,
            false,
            true,
            amount
        );

        //external call

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

    function createMarketSale(uint256 itemId, uint256 amount)
        public
        payable
        nonReentrant
    {
        MarketItem storage marketItem = idToMarketItem[itemId];

        uint256 price = marketItem.price * amount;
        uint256 _tokenId = marketItem.tokenId;
        uint256 amountleft = marketItem.amount - amount;

        require(msg.value >= price, "You should include the price of the item");
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

        ERC1155LazyContract.safeTransferFrom(
            address(this),
            msg.sender,
            _tokenId,
            amount,
            ""
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

    function createBatchMarketItem(
        uint256[] memory tokenIds,
        uint256[] memory prices,
        uint256[] memory amounts,
        bytes memory data
    ) public payable nonReentrant returns (uint256) {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _itemIds.increment();
            uint256 itemId = _itemIds.current();
            idToMarketItem[itemId] = MarketItem(
                itemId,
                tokenIds[i],
                payable(msg.sender),
                prices[i],
                false,
                true,
                amounts[i]
            );

            //external call
            ERC1155LazyContract.safeBatchTransferFrom(
                msg.sender,
                address(this),
                tokenIds,
                amounts,
                data
            );

            emit MarketItemCreated(
                itemId,
                tokenIds[i],
                msg.sender,
                prices[i],
                block.timestamp
            );
        }
        return _itemIds.current();
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
        (creator, royaltyAmount) = ERC1155LazyContract.royaltyInfo(
            tokenId,
            price
        );
        return (marketShareAmount, royaltyAmount, creator);
    }
}
