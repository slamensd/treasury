async function loadBalance() {
    try {
        const account = await ethereum.selectedAddress;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const nftTokenContract = new ethers.Contract(nftTokenAddress, nftTokenAbi, signer);
        const balance = await nftTokenContract.balanceOf(account);
        document.getElementById('nft-balance').innerText = `You own ${balance} NFTs`;

        // enable the stake button if the user owns at least 5 NFTs
        const stakeButton = document.getElementById('stake-button');
        if (balance.toNumber() >= 5) {
            stakeButton.disabled = false;
            stakeButton.addEventListener('click', stakeTokens);
        } else {
            stakeButton.disabled = true;
        }
    } catch (error) {
        console.error('Error in token loading: ', error);
    }
}

async function stakeTokens() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const stakingContract = new ethers.Contract(stakingAddress, stakingAbi, signer);
        
        // Approve staking contract to transfer 5 NFTs
        const nftTokenContract = new ethers.Contract(nftTokenAddress, nftTokenAbi, signer);
        const approveTx = await nftTokenContract.setApprovalForAll(stakingAddress, true);
        await approveTx.wait();

        // Call the stake function
        const stakeTx = await stakingContract.stake(5);
        await stakeTx.wait();

        // Refresh balance
        loadBalance();
    } catch (error) {
        console.error('Error in staking: ', error);
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
