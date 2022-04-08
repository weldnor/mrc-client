import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  //
  // private readonly _url = "ws://localhost/ws";
  // private _ws?: WebSocket;
  //
  //
  // async getWebSocket(): Promise<WebSocket> {
  //   if (this._ws) {
  //     return this._ws;
  //   }
  //
  //   return new Promise((resolve) => {
  //     console.log()
  //     this._ws = new WebSocket(this._url);
  //     this._ws.onopen = () => resolve(this._ws);
  //   })
  // }
}
