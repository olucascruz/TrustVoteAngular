import { Component, OnInit } from '@angular/core';
import { ContractService, IElectionInfo, IProposalInfo, IWinningProposalResult } from 'src/app/services/contract.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit{

    activeElections: number[] = [];
    elections: IElectionInfo[] = []
    electionInfo: IElectionInfo | undefined;
    proposalInfo: IProposalInfo | undefined;
    winningProposal: IWinningProposalResult| undefined;

    state:string = "default"
    codeVotation:String;
    candidates:[string?];

    electionName: string = '';
    proposalNamesInput: string = '';
    durationMinutes: number = 0;
    createdElectionId: number | null = null;
    errorMessage: string | null = null;
    private contractService!:ContractService;
    private walletAddress: string | null = null;

    constructor(private route: ActivatedRoute){

      this.codeVotation = ''
      this.candidates = []

      this.walletAddress = null
      this.route.queryParams.subscribe(params => {
        this.walletAddress = params['wallet'] || null;
        if(this.walletAddress){
          this.contractService = new ContractService();
          this.contractService.initialize(this.walletAddress)
        }
        console.log(this.walletAddress)
      });

    }

    ngOnInit(): void {

    }

    goToCreateElection():void {
      this.state = 'createElection'
    }

    createElection(): void {
      const proposalNames = this.proposalNamesInput.split(',').map(name => name.trim());
      console.log(proposalNames)
      this.contractService.createElection(this.electionName, proposalNames, this.durationMinutes).subscribe({
        next: (electionId) => {
          this.createdElectionId = electionId;
          this.errorMessage = null;
          console.log(`Election created with ID: ${electionId}`);
        },
        error: (err) => {
          this.errorMessage = 'Error creating election: ' + err.message;
          this.createdElectionId = null;
          console.error('Error creating election', err);
        }
      });
    }

    getCandidates(){
      console.log(this.codeVotation)
    }

    loadElectionInfo(electionId: number): void {
      this.contractService.getElectionInfo(electionId).subscribe({
        next: (info) => this.electionInfo = info,
        error: (err) => console.error('Error loading election info', err)
      });
    }

    loadElectionsInfo(electionId: number): void {
      this.contractService.getElectionInfo(electionId).subscribe({
        next: (info) => this.elections.push(info),
        error: (err) => console.error('Error loading election info', err)
      });
    }

    oadProposalInfo(proposalId: number): void {
      this.contractService.getProposalInfo(proposalId).subscribe({
        next: (info) => this.proposalInfo = info,
        error: (err) => console.error('Error loading proposal info', err)
      });
    }

    loadWinningProposal(electionId: number): void {
      this.contractService.winningProposal(electionId).subscribe({
        next: (proposal) => this.winningProposal = proposal,
        error: (err) => console.error('Error loading winning proposal', err)
      });
    }

}
