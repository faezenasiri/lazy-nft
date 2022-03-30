pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Lazy1155 is EIP712, ERC1155 {
    using ECDSA for bytes32;

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
                            "NFTVoucher(uint256 tokenId,uint256 minPrice,uint256 amount,string uri)"
                        ),
                        voucher.tokenId,
                        voucher.minPrice,
                        voucher.amount,
                        keccak256(bytes(voucher.uri))
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

    function mint(
        uint256 tokenId,
        uint256 amount,
        string memory url
    ) public {
        _mint(_msgSender(), tokenId, amount, "");
        setURI(tokenId, url);
    }

    //start marketplace

    mapping(uint256 => uint256) internal idtoprice;
    mapping(uint256 => address) internal idtoseller;

    function createitem(uint256 _id, uint256 price) public {
        idtoprice[_id] = price;
        safeTransferFrom(
            _msgSender(),
            address(this),
            _id,
            balanceOf(_msgSender(), _id),
            ""
        );
        idtoseller[_id] = _msgSender();
    }

    function buyitem(uint256 _id) public payable {
        require(msg.value >= idtoprice[_id], "Insufficient funds ");

        safeTransferFrom(
            _msgSender(),
            address(this),
            _id,
            balanceOf(_msgSender(), _id),
            ""
        );

        pendingWithdrawals[idtoseller[_id]] += msg.value;
    }
}
