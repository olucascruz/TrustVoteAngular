import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { Observable, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';



export interface IWinningProposalResult {
  id: number;
  name: string;
  voteCount: number;
}

export interface IElectionInfo {
  name: string;
  endTime: number;
  proposalTotal: number;
}

export interface IProposalInfo {
  name: string;
  voteCount: number;
}

@Injectable({
  providedIn: 'root'
})

export class ContractService {
  private web3: Web3 | null = null;
  private contract: any;
  private contractAddress:string = '';
  private readonly contractABI = [ {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "electionName",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32[]",
        "name": "proposalNames",
        "type": "bytes32[]"
      },
      {
        "internalType": "uint256",
        "name": "durationMinutes",
        "type": "uint256"
      }
    ],
    "name": "createElection",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "electionId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "electionId",
        "type": "uint256"
      }
    ],
    "name": "getElectionInfo",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "name",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "proposalTotal",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "getProposalInfo",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "name",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveElections",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "activeElections",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "electionId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "electionId",
        "type": "uint256"
      }
    ],
    "name": "winningProposal",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "name",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "voteCount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Voting.Proposal",
        "name": "winningProposal_",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  } ];

  constructor() {
  }

  initialize(_contractAddress: string) {
    this.contractAddress = _contractAddress;
    this.initializeWeb3();
    this.initializeContract();
  }

  private async initializeWeb3() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
      } catch (error) {
        console.error('User denied account access', error);
      }
    } else {
      console.warn('No Ethereum provider detected');
    }
  }

  private initializeContract() {
    if (this.web3) {
      this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
    }
  }

  createElection(electionName: string, proposalNames: string[], durationMinutes: number): Observable<number> {
    return from(
      this.contract.methods.createElection(
        this.web3?.utils.asciiToHex(electionName) || '0x',
        proposalNames.map(name => this.web3?.utils.asciiToHex(name) || '0x'),
        durationMinutes
      ).send({ from: this.web3?.eth.defaultAccount || '0x' })
    ).pipe(
      map((receipt: any) => {
        return parseInt(receipt.events.ElectionCreated.returnValues.electionId, 10);
      }),
      catchError(error => {
        console.error('Error creating election', error);
        throw error;
      })
    );
  }

  getElectionInfo(electionId: number): Observable<IElectionInfo> {
    return from(
      this.contract.methods.getElectionInfo(electionId).call() as Promise<IElectionInfo>
    ).pipe(
      map((result: IElectionInfo) => {
        return {
          name: this.web3?.utils.hexToAscii(result.name).replace(/\0/g, '') || '',
          endTime: result.endTime,
          proposalTotal: result.proposalTotal
        };
      }),
      catchError(error => {
        console.error('Error fetching election info', error);
        throw error;
      })
    );
  }

  getProposalInfo(proposalId: number): Observable<IProposalInfo> {
    return from(
      this.contract.methods.getProposalInfo(proposalId).call() as Promise<IProposalInfo>
    ).pipe(
      map((result:IProposalInfo) => {
        return {
          name: this.web3?.utils.hexToAscii(result.name).replace(/\0/g, '')||'',
          voteCount: result.voteCount
        };
      }),
      catchError(error => {
        console.error('Error fetching proposal info', error);
        throw error;
      })
    );
  }


  getActiveElections(): Observable<number[]> {
    return from(
      this.contract.methods.getActiveElections().call()
    ).pipe(
      map((result: any) => result.map((id: string) => parseInt(id, 10))),
      catchError(error => {
        console.error('Error fetching active elections', error);
        throw error;
      })
    );
  }

  vote(electionId: number, proposalId: number): Observable<void> {
    return from(
      this.contract.methods.vote(electionId, proposalId).send({ from: this.web3?.eth.defaultAccount || '0x' })
    ).pipe(
      map(() => undefined),
      catchError(error => {
        console.error('Error voting', error);
        throw error;
      })
    );
  }

  winningProposal(electionId: number): Observable<{ id: number; name: string; voteCount: number }> {
    return from(
      this.contract.methods.winningProposal(electionId).call() as Promise<IWinningProposalResult>
    ).pipe(
      map((result: IWinningProposalResult) => {
        const name = result.name ? this.web3?.utils.hexToAscii(result.name).replace(/\0/g, '') : '';

        // Garantir que todos os valores são formatados corretamente
        return {
          id: result.id || 0,
          name: name || '',
          voteCount: result.voteCount
        };
      }),
      catchError(error => {
        console.error('Error fetching winning proposal', error);
        throw error;
      })
    );
  }




}
