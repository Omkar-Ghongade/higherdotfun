// utils/uploadToIPFS.ts
"use server"
import axios from 'axios';

export async function uploadToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    maxContentLength: Infinity,
    headers: {
      'Content-Type': 'multipart/form-data',
      pinata_api_key: '427c44bf9e737284d9e9',
      pinata_secret_api_key: '7e182e5a728497201a6476fb5f661904ddbd1b46c84e04136b72623519d602fds',
    },
  });

  const cid = res.data.IpfsHash;
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
