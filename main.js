const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let nftTokenContract;
let stakingContract;

const nftTokenAddress = '0xdf9669a65c5845e472ad3ca83d07605a9d7701b7';
const treasuryTokenAddress = '0x232765be70a5f0b49e2d72eee9765813894c1fc4';
const stakingContractAddress = 'YOUR_STAKING_CONTRACT_ADDRESS';  // replace with your contract's address
const treasuryTokenId = 'YOUR_TREASURY_TOKEN_ID';  // replace with your token's ID

// Connect wallet button
document.getElementById('connectButton').addEventListener('click', async () => {
    try {
        await window.ethereum.enable();
        signer = provider.getSigner();
        nftTokenContract = new ethers.Contract(nftTokenAddress, ['function balanceOf(address owner) view returns (uint256)', 'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)'], provider);
        stakingContract = new ethers.Contract(stakingContractAddress, ['function stakeNFT(uint256[] calldata tokenIds) external', 'function unstake() external'], signer);
        document.getElementById('stakeSection').classList.remove('hidden');
        await loadTokens();
    } catch (error) {
        console.error('Error in wallet connection: ', error);
    }
});

async function loadTokens() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const balance = await nftTokenContract.balanceOf(accounts[0]);
        const tokenListDiv = document.getElementById('tokenList');
        tokenListDiv.innerHTML = '';

        for(let i = 0; i < balance; i++) {
            const tokenId = await nftTokenContract.tokenOfOwnerByIndex(accounts[0], i);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tokenId.toString();
            tokenListDiv.appendChild(checkbox);
            tokenListDiv.appendChild(document.createTextNode(` Token ID: ${tokenId.toString()}`));
            tokenListDiv.appendChild(document.createElement('br'));
        }
    } catch (error) {
        console.error('Error in token loading: ', error);
    }
}

// Stake NFTs button
document.getElementById('stakeButton').addEventListener('click', async () => {
    try {
        const checkboxes = Array.from(document.getElementById('tokenList').querySelectorAll('input[type=checkbox]'));
        const selectedTokenIds = checkboxes.filter(cb => cb.checked).map(cb => ethers.BigNumber.from(cb.value));

        if (selectedTokenIds.length !== 5) {
            alert('You must select exactly 5 NFTs to stake.');
            return;
        }

        const tx = await stakingContract.connect(signer).stakeNFT(selectedTokenIds);
        await tx.wait();
        alert('NFTs staked successfully!');
        await loadTokens();
    } catch (error) {
        console.error('Error in staking NFTs: ', error);
    }
});

// Unstake button
document.getElementById('unstakeButton').addEventListener('click', async () => {
    try {
        const tx = await stakingContract.connect(signer).unstake();
        await tx.wait();
        alert('Treasury Token unstaked successfully!');
        await loadTokens();
    } catch (error) {
        console.error('Error in unstaking: ', error);
    }
});
