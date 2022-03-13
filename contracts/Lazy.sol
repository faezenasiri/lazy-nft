pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract Lazy is ERC721URIStorage, EIP712, AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    mapping(address => uint256) pendingWithdrawals;

    constructor() ERC721("LazyNFT", "LAZ") EIP712("Name", "1.0.0") {}

    function redeem(
        address redeemer,
        uint256 tokenId,
        uint256 minPrice,
        bytes memory signature
    ) public payable returns (uint256) {
        // make sure signature is valid and get the address of the signer
        address signer = _verify(tokenId, minPrice, signature);

        // make sure that the signer is authorized to mint NFTs

        // make sure that the redeemer is paying enough to cover the buyer's cost
        require(msg.value >= minPrice, "Insufficient funds to redeem");

        // first assign the token to the signer, to establish provenance on-chain
        _mint(signer, tokenId);

        // transfer the token to the redeemer
        _transfer(signer, redeemer, tokenId);

        // record payment to signer's withdrawal balance
        pendingWithdrawals[signer] += msg.value;

        return tokenId;
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

    function _hash(uint256 tokenId, uint256 minPrice)
        internal
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "NFTVoucher(uint256 tokenId,uint256 minPrice)"
                        ),
                        tokenId,
                        minPrice
                    )
                )
            );
    }

    function _verify(
        uint256 tokenId,
        uint256 minPrice,
        bytes memory signature
    ) internal view returns (address) {
        bytes32 digest = _hash(tokenId, minPrice);
        address fu = ECDSA.recover(digest, signature);

        return fu;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC721)
        returns (bool)
    {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }
}
