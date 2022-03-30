pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC2981/IERC2981.sol";

contract ERC1155lazy is EIP712, ERC1155, IERC2981 {
    using ECDSA for bytes32;

    event TokenCreated(
        address owner,
        uint256 tokenId,
        string tokenURI,
        uint256 royalty
    );

    struct Royalty {
        address receiver;
        uint256 percentage;
    }
    mapping(uint256 => Royalty) internal royalties;

    string public name;
    string public symbol;

    mapping(address => uint256) pendingWithdrawals;
    mapping(uint256 => string) public tokenURI;

    constructor() ERC1155("") EIP712("Name", "1.0.0") {
        name = "nft";
        symbol = "nft";
    }

    struct NFTVoucher {
        uint256 tokenId;
        uint256 minPrice;
        uint256 amount;
        string uri;
        uint256 royaltyPercentage;
    }

    function redeem(
        address redeemer,
        NFTVoucher calldata voucher,
        bytes memory signature
    ) public payable returns (uint256) {
        address signer = _verify(voucher, signature);
        require(msg.value >= voucher.minPrice, "Insufficient funds to redeem");
        _mint(signer, voucher.tokenId, voucher.amount, "");
        setURI(voucher.tokenId, voucher.uri);
        _safeTransferFrom(
            signer,
            redeemer,
            voucher.tokenId,
            voucher.amount,
            ""
        );
        pendingWithdrawals[signer] += msg.value;

        _setRoyalty(voucher.tokenId, signer, voucher.royaltyPercentage);
        emit TokenCreated(
            _msgSender(),
            voucher.tokenId,
            voucher.uri,
            voucher.royaltyPercentage
        );

        return voucher.tokenId;
    }

    function withdraw() public {
        // IMPORTANT: casting msg.sender to a payable address is only safe if ALL members of the minter role are payable addresses.
        address payable receiver = payable(msg.sender);

        uint256 amount = pendingWithdrawals[receiver];
        // zero account before transfer to prevent re-entrancy attack
        pendingWithdrawals[receiver] = 0;
        receiver.transfer(amount);
    }

    function availableToWithdraw() public view returns (uint256) {
        return pendingWithdrawals[msg.sender];
    }

    function _hash(NFTVoucher calldata voucher)
        internal
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "NFTVoucher(uint256 tokenId,uint256 minPrice,uint256 amount,string uri,royaltyPercentage)"
                        ),
                        voucher.tokenId,
                        voucher.minPrice,
                        voucher.amount,
                        keccak256(bytes(voucher.uri)),
                        voucher.royaltyPercentage
                    )
                )
            );
    }

    function _verify(NFTVoucher calldata voucher, bytes memory signature)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hash(voucher);
        address fu = ECDSA.recover(digest, signature);
        return fu;
    }

    function setURI(uint256 _id, string memory _uri) internal {
        tokenURI[_id] = _uri;
    }

    function uri(uint256 _id) public view override returns (string memory) {
        return tokenURI[_id];
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

    function mint(
        uint256 tokenId,
        uint256 amount,
        string memory url,
        uint256 royaltyPercentage
    ) public {
        _mint(_msgSender(), tokenId, amount, "");
        setURI(tokenId, url);
        _setRoyalty(tokenId, _msgSender(), royaltyPercentage);
        emit TokenCreated(_msgSender(), tokenId, url, royaltyPercentage);
    }

    //start marketplace

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
