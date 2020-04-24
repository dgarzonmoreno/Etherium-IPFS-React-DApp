import React, { useState } from 'react';
import web3 from "web3";
import storehash from '../storehash';
import ipfs from '../ipfs';
import { Header, Icon } from 'semantic-ui-react';


const EtheriumApp = () => {

    const [ipfsHash, setIpfsHash] = useState( null );
    const [buffer, setBuffer] = useState('');
    const [ethAddress, setEthAddress] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [transactionHash, setTransactionHash] = useState('');
    const [gasUsed, setGasUsed] = useState('');
    const [txReceipt, setTxReceipt] = useState('');

    const captureFile = (event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)    
    };

    const convertToBuffer = async (reader) => {
        //file is converted to a buffer to prepare for uploading to IPFS
        const buffer = await Buffer.from(reader.result);
        //set this buffer -using es6 syntax
        setBuffer(buffer);
    };

    const onClick = async () => {
        try{
            this.setState({blockNumber:"waiting.."});
            this.setState({gasUsed:"waiting..."});
            
            await web3.eth.getTransactionReceipt(transactionHash, (err, txReceipt)=>{
              console.log(err,txReceipt);
              setTxReceipt(txReceipt);
            });
            await setBlockNumber(txReceipt.blockNumber);
            await setGasUsed(txReceipt.gasUsed);

        } catch (error) {
            console.log(error);
        }
    }

    const onSubmit = async (event) => {
        event.preventDefault();

        //bring in user's metamask account address
        const accounts = await web3.eth.getAccounts();
        console.log('Sending from Metamask account: ' + accounts[0]);
  
        //obtain contract address from storehash.js
        const ethAddress = await storehash.options.address;
        setEthAddress(ethAddress);
  
        //save document to IPFS,return its hash#, and set hash# to state
        //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add 
        await ipfs.add(this.state.buffer, (err, hash) => {
          console.log(err,hash);
          //setState by setting ipfsHash to ipfsHash[0].hash 
          setIpfsHash(hash[0].hash);
          
          storehash.methods.sendHash(ipfsHash).send({
            from: accounts[0] 
          }, (error, transactionHash) => {
            console.log(transactionHash);
            setTransactionHash(transactionHash);
          }); //storehash 
        }) //await ipfs.add 
    };


    return(
        <Header 
        as='h1' 
        icon 
        style = {{'paddingTop': '10%'}}
        >
            <Icon name='ethereum' />
                IPFS x Etherium 
            <Header.Subheader>
                Use IPFS to upload documents and Etherium to store their hash
            </Header.Subheader>
        </Header>
    );
};

export default EtheriumApp;