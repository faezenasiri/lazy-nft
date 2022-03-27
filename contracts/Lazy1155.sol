pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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

    /// @notice Represents an un-minted NFT, which has not yet been recorded into the blockchain. A signed voucher can be redeemed for a real NFT using the redeem function.
    struct NFTVoucher {
        /// @notice The id of the token to be redeemed. Must be unique - if another token with this ID already exists, the redeem function will revert.
        uint256 tokenId;
        /// @notice The minimum price (in wei) that the NFT creator is willing to accept for the initial sale of this NFT.
        uint256 minPrice;
        /// @notice The metadata URI to associate with this token.

        uint256 amount;
        string uri;
    }

    function redeem(
        address redeemer,
        NFTVoucher calldata voucher,
        bytes memory signature
    ) public payable returns (uint256) {
        // make sure signature is valid and get the address of the signer
        address signer = _verify(voucher, signature);

        // make sure that the signer is authorized to mint NFTs

        // make sure that the redeemer is paying enough to cover the buyer's cost
        require(msg.value >= voucher.minPrice, "Insufficient funds to redeem");

        // first assign the token to the signer, to establish provenance on-chain

        _mint(signer, voucher.tokenId, voucher.amount, "");
        setURI(voucher.tokenId, voucher.uri);
        // transfer the token to the redeemer
        _safeTransferFrom(
            signer,
            redeemer,
            voucher.tokenId,
            voucher.amount,
            ""
        );

        // record payment to signer's withdrawal balance
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

    /// @notice Returns a hash of the given NFTVoucher, prepared using EIP712 typed data hashing rules.
    /// @param voucher An NFTVoucher to hash.
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

    /// @notice Verifies the signature for a given NFTVoucher, returning the address of the signer.
    /// @dev Will revert if the signature is invalid. Does not verify that the signer is authorized to mint NFTs.
    /// @param voucher An NFTVoucher describing an unminted NFT.
    /// @param signature An EIP712 signature of the given voucher.
    function _verify(NFTVoucher calldata voucher, bytes memory signature)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hash(voucher);
        address fu = ECDSA.recover(digest, signature);
        return fu;
    }

    function setURI(uint256 _id, string memory _uri) public {
        tokenURI[_id] = _uri;
        emit URI(_uri, _id);
    }

    function uri(uint256 _id) public view override returns (string memory) {
        return tokenURI[_id];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155)
        returns (bool)
    {
        return ERC1155.supportsInterface(interfaceId);
    }
}
