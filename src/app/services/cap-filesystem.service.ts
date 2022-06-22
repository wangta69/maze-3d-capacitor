import { Filesystem, Directory, Encoding, GetUriOptions, GetUriResult } from '@capacitor/filesystem';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RestHttpClient } from 'ng-rest-http';

@Injectable()
export class FileSystemService {
    constructor(
        private http: RestHttpClient
    ) {
    }



    public async writeSecretFile(): Promise<void> {
      await Filesystem.writeFile({
        path: 'secrets/text.txt',
        data: "This is a test",
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

    };

    public async readSecretFile(): Promise<void> {
        const contents = await Filesystem.readFile({
            path: 'secrets/text.txt',
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });

    };

    public async deleteSecretFile(): Promise<void> {
        await Filesystem.deleteFile({
            path: 'secrets/text.txt',
            directory: Directory.Documents,
        });
    };

    public async readFilePath(): Promise<void> {
        // Here's an example of reading a file with a full file path. Use this to
        // read binary data (base64 encoded) from plugins that return File URIs, such as
        // the Camera.
        // const contents = await Filesystem.readFile({
        // path: 'file:///var/mobile/Containers/Data/Application/22A433FD-D82D-4989-8BE6-9FC49DEA20BB/Documents/text.txt'
        // });

    };

    // getUri(options: GetUriOptions) => Promise<GetUriResult>
    /**
     *@param options : {path: string, directory: string}
     */
    public async getUri(options: GetUriOptions): Promise<GetUriResult> {
        const url = await Filesystem.getUri({
            path: options.path,
            directory: this.directory(options.directory),
        });
        // {"uri":"file:///data/user/0/game.pondol.nonogram.app/files"}
        return url
    };

    public async getDir(directory: string): Promise<GetUriResult> {
        const url = await Filesystem.getUri({
            path: '',
            directory: this.directory(directory),
        });
        return url;
    };


    private directory(dir: string) {
        switch (dir) {
            case 'Documents':
                return Directory.Documents;
            case 'Data':
                return Directory.Data;
            case 'Cache':
                return Directory.Cache;
            case 'External':
                return Directory.External;
            case 'ExternalStorage':
                return Directory.ExternalStorage;
            default:
                return Directory.Documents;
        }

    }

    public async storeImage(url: string, file: string, directory: string, filetype?: string): Promise<void> {
        this.http.filedownload({url, headers: this.headers}, 'image/png').then(async blob => {
            const base64Data = await this.arrayBufferToBase64(blob);
            try {
                const result = await Filesystem.writeFile({
                    // data: blob,
                    data: base64Data,
                    path: file,
                    directory: this.directory(directory)
                });

                // console.log('Filesystem.writeFile result: ', JSON.stringify(result));
            } catch (e) {
                console.error('Filesystem.writeFile error', e);
            }

        }, (err) => {
            console.error('err', err);
        });
    }

    private async arrayBufferToBase64(buffer: any) {
       var binary = '';
       var bytes = new Uint8Array(buffer);
       var len = bytes.byteLength;
       for (var i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
       }
       return window.btoa(binary);
    }

    private convertBlobToBase64 = (blob :Blob)=>new Promise ((resolve, reject) =>{
        const reader = new FileReader;
        reader.onerror = reject;
        reader.onload = () =>{
            resolve(reader.result);
        };
        reader.readAsDataURL(blob);
    });

    // private async convertBlobToBase64(blob :Blob): Promise<string> {
    //     const reader = new FileReader;
    //     reader.onerror = reject;
    //     reader.onload = () =>{
    //         resolve(reader.result);
    //     };
    //     reader.readAsDataURL(blob);
    // };


    private getMimetype(name: string){
        if(name.indexOf('pdf') >=0) {
            return 'application/pdf';
        }
        return '';
    }

    // 'Content-Type': 'application/json',
    // "Content-Type" = "text/html;charset=utf-8";
    // Content-Type: image/png
    private headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'image/png',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*'
    };
}

