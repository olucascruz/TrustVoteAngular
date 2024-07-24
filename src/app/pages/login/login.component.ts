import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import detectEthereumProvider from "@metamask/detect-provider";

// for navigating to other routes
import { Router } from "@angular/router";
declare global {
  interface Window {
    ethereum: any;
  }
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})



export class LoginComponent implements OnInit{
  @ViewChild('accountText') accountText!: ElementRef;
  public provider:any
  constructor(private router: Router) {}
  ngOnInit(): void {
    this.getAccount()
  }
  ngAfterViewInit() {
    // this.accountText.nativeElement.textContent = '...';
  }
  changeText(text:String) {
    this.accountText.nativeElement.textContent = text;
  }
  async handleAuth() {
    const accountText = document.getElementById("account-text");
    const accounts = await this.provider.request({ method: "eth_requestAccounts" }).catch((err:any) => {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error.
        // If this happens, the user rejected the connection request.
        console.log("Please connect to MetaMask.");
        this.changeText("Please connect to MetaMask.")
        return
      } else {
        console.error(err);
      }
    });

    const account = accounts[0]
    this.changeText(account)
    const params = { wallet: String(account) };
    this.router.navigate(["/home"], { queryParams: params })
  }

  async getAccount(){
    this.provider = await detectEthereumProvider()
    if (this.provider && this.provider === window.ethereum) {
      console.log("MetaMask is available!");
      // startApp(provider); // Initialize your dapp with MetaMask.
    } else {
      console.log("Please install MetaMask!");
      this.changeText("Please install MetaMask!")
    }
  }
}





