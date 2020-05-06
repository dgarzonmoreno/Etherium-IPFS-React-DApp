import React, { useState, useRef, Fragment } from 'react';
import web3 from '../web3';
import storehash from '../storehash';
import ipfs from '../ipfs';
import { Divider, Form, Header, Icon, Label, Segment, Table } from 'semantic-ui-react';


const EtheriumApp = () => {

    const [ipfsHash, setIpfsHash] = useState(null);
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
        console.log(file);
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => convertToBuffer(reader)
    };
    const convertToBuffer = async (reader) => {
        //file is converted to a buffer to prepare for uploading to IPFS
        const buffer = await Buffer.from(reader.result);
        //set this buffer -using es6 syntax
        setBuffer(buffer);
    };

    const onClick = async () => {
        try {
            this.setState({ blockNumber: "waiting.." });
            this.setState({ gasUsed: "waiting..." });

            await web3.eth.getTransactionReceipt(transactionHash, (err, txReceipt) => {
                console.log(err, txReceipt);
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
        await ipfs.add(buffer, (err, hash) => {
            console.log(err, hash);
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

    return (
        <Fragment >
            <Segment textAlign='center' style={{ 'marginTop': '10%' }}>
                <Header
                    as='h1'
                    icon
                >
                    <Icon name='ethereum' />
                IPFS x Etherium
                <Header.Subheader>Use IPFS to upload documents and Etherium to store their hash</Header.Subheader>
                </Header>

                <Divider horizontal> Choose file to send to IPFS</Divider>

                <Form
                    onSubmit={onSubmit}
                >
                    <Form.Group
                        widths='equal'
                    >
                        {/* <Form.Button
                            icon='file'
                            onClick = { () => { fileInputRef.current.click() } }
                        /> */}
                        <input
                            type='file'
                            onChange={captureFile}
                        />
                        <Form.Button color='twitter' type='submit'>Send!</Form.Button>
                    </Form.Group>
                </Form>

                <Divider horizontal> Transaction History</Divider>


                {
                    ipfsHash && ethAddress && transactionHash &&
                    <Table celled style={{ 'marginTop': '10%' }}>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Tx Receipt Category</Table.HeaderCell>
                                <Table.HeaderCell>Values</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>
                                    <Label ribbon>IPFS Hash # stored on Eth Contract</Label>
                                </Table.Cell>
                                <Table.Cell>{this.state.ipfsHash}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Label ribbon>Ethereum Contract Address</Label>
                                </Table.Cell>
                                <Table.Cell>{this.state.ethAddress}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell >
                                    <Label ribbon>Tx Hash #</Label>
                                </Table.Cell>
                                <Table.Cell>{this.state.transactionHash}</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                }
            </Segment>
        </Fragment>
    );
};

export default EtheriumApp;