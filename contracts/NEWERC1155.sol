// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "./ERC2981/IERC2981.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract NewERC1155 is Ownable, ERC1155Burnable, IERC2981 {
    string public name;
    string public symbol;
    using Counters for Counters.Counter;

    Counters.Counter internal _tokenIds;

    address marketPlace;

    struct Royalty {
        address receiver;
        uint256 percentage;
    }

    mapping(uint256 => Royalty) internal royalties;

    mapping(uint256 => string) public tokenURI;

    event TokenBurnt(address account, uint256 tokenId, uint256 amount);
    event TokenBurntBatch(
        address account,
        uint256[] tokenIds,
        uint256[] amounts
    );

    event TokenCreated(
        address owner,
        uint256 tokenId,
        string tokenURI,
        uint256 amount,
        uint256 royalty
    );
    event TokenBatchCreated(
        address owner,
        uint256[] tokenIds,
        string[] tokenURIs,
        uint256[] amounts,
        uint256[] royalty
    );

    constructor() ERC1155("") {
        name = "nft";
        symbol = "nft";
    }

    function mint(
        uint256 amount,
        string memory url,
        uint256 royaltyPercentage
    ) public {
        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        _mint(_msgSender(), id, amount, "");
        tokenURI[id] = url;
        _setRoyalty(id, _msgSender(), royaltyPercentage);

        emit TokenCreated(_msgSender(), id, url, amount, royaltyPercentage);
    }

    function mintBatch(
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data,
        string[] memory urls,
        uint256[] memory royaltyPercentage
    ) external {
        _mintBatch(_msgSender(), ids, amounts, data);
        for (uint256 i = 0; i < ids.length; i++) {
            tokenURI[ids[i]] = urls[i];
            _setRoyalty(ids[i], _msgSender(), royaltyPercentage[i]);
        }

        emit TokenBatchCreated(
            _msgSender(),
            ids,
            urls,
            amounts,
            royaltyPercentage
        );
    }

    function initMarket(address market) public onlyOwner {
        marketPlace = market;
    }

    function aprovalMarketPlacesForAccount() public {
        setApprovalForAll(marketPlace, true);
    }

    function isMArketPlaceActiveForAccount() public view returns (bool) {
        return (isApprovedForAll(msg.sender, marketPlace));
    }

    function uri(uint256 _id) public view override returns (string memory) {
        return tokenURI[_id];
    }

    function burn(
        address account,
        uint256 _tokenId,
        uint256 amount
    ) public override {
        super.burn(account, _tokenId, amount);

        emit TokenBurnt(_msgSender(), _tokenId, amount);
    }

    function burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory values
    ) public override {
        require(
            account == _msgSender() || isApprovedForAll(account, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );

        _burnBatch(account, ids, values);

        emit TokenBurntBatch(_msgSender(), ids, values);
    }

    function _setRoyalty(
        uint256 _tokenId,
        address _receiver,
        uint256 _percentage
    ) internal {
        royalties[_tokenId] = Royalty(_receiver, _percentage);
    }

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        public
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        receiver = royalties[_tokenId].receiver;

        // This sets percentages by price * percentage / 100
        royaltyAmount = (_salePrice * royalties[_tokenId].percentage) / 100;
    }

    function getRoyaltyPercentage(uint256 _tokenId)
        public
        view
        returns (uint256)
    {
        return royalties[_tokenId].percentage;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155)
        returns (bool)
    {
        if (interfaceId == type(IERC2981).interfaceId) {
            return true;
        }
        return super.supportsInterface(interfaceId);
    }
}
