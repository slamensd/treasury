const nftTokenAddress = "0xdf9669A65c5845E472ad3Ca83d07605a9d7701b7";
const stakingAddress = "0xYourStakingContractAddressHere";
const treasuryAddress = "0x232765BE70A5f0b49e2d72EEE9765813894C1Fc4";
const nftTokenAbi = [...]; // the ABI of your ERC-721 token
const stakingAbi = [...]; // the ABI of your Staking contract

async function loadBalance() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftTokenContract = new ethers.Contract(nftTokenAddress, nftTokenAbi, signer);
        const account = await signer.getAddress();

        // Get balance
        const balance = await nftTokenContract.balanceOf(account);
        document.getElementById('nft-balance').innerText = `Balance: ${balance}`;

        // Enable or disable the staking button based on the balance
        document.getElementById('stake-button').disabled = balance < 5;
    } catch (error) {
        console.error('Error in balance loading: ', error);
    }
}

async function stakeTokens() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const stakingContract = new ethers.Contract(stakingAddress, stakingAbi, signer);

        // Call the stake function
        const stakeTx = await stakingContract.stake();
        await stakeTx.wait();

        // Refresh balance
        loadBalance();
    } catch (error) {
        console.error('Error in staking: ', error);
    }
}

async function unstakeTokens() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const stakingContract = new ethers.Contract(stakingAddress, stakingAbi, signer);

        // Call the unstake function
        const unstakeTx = await stakingContract.unstake();
        await unstakeTx.wait();

        // Refresh balance
        loadBalance();
    } catch (error) {
        console.error('Error in unstaking: ', error);
    }
}

document.getElementById('connect-button').addEventListener('click', async () => {
    if (typeof ethereum !== 'undefined') {
        try {
            const accounts = await ethereum.enable();
            const account = accounts[0];
            document.getElementById('wallet-address').innerText = account;
            loadBalance();
        } catch (error) {
            console.error('Error in wallet connection: ', error);
        }
    } else {
        alert('Please install MetaMask!');
    }
});

document.getElementById('stake-button').addEventListener('click', stakeTokens);
document.getElementById('unstake-button').addEventListener('click', unstakeTokens);
