import fs, { write } from 'fs';
import { Address, toNano } from '@ton/core';
import { SbtItem } from '../wrappers/sbt-item/SbtItem';
import { NftCollection } from "../wrappers/nft-collection/NftCollection";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    // founder: 
    // FWB: 
    const collection_address = '';

    const collection = provider.open(
        NftCollection.createFromAddress(Address.parse(collection_address))
    );

    console.log('Collection address:', collection.address);

    if (!(await provider.isContractDeployed(collection.address))) {
        console.log('Collection not deployed');
        return;
    }

    const num_of_items = (await collection.getCollectionData()).nextItemId;
    console.log('Number of items:', num_of_items);
    let owner_addresses = [];
    for(let i = 0; i < num_of_items; i++) {
        let itemAddress = await collection.getNftAddressByIndex(i);
        if (!(await provider.isContractDeployed(itemAddress))) {
            console.log('Item', i, 'not deployed');
            continue;
        }

        const item = provider.open(
            SbtItem.createFromAddress(itemAddress)
        );

        let itemData = await item.getNftData();
        const owner_address = (itemData.ownerAddress ? itemData.ownerAddress!.toString({
            urlSafe: true,
            bounceable: false,
            testOnly: false
        }) : 'null');
        if(owner_address !== 'null') {
            owner_addresses.push(owner_address);
        }
        console.log('Item', i, 'owner address:', owner_address);
    }
    
    // write owner addresses to a file
    const ownerAddressesFile = "owner_addresses.json";
    let ownerAddressesStr = JSON.stringify(owner_addresses, null, 2);
    fs.writeFileSync(ownerAddressesFile, ownerAddressesStr);
    console.log('Owner addresses saved to ', ownerAddressesFile);
}
