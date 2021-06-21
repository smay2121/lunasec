import { downloadFile } from '@lunasec/js-sdk';
import {
  onLunaSecAuthError,
  SecureDownload,
  SecureForm,
  SecureInput,
  SecureParagraph,
  SecureTextArea,
  SecureUpload,
} from '@lunasec/react-sdk';
import React from 'react';

// import logo from './logo.svg';
import './App.css';

interface FormData {
  foo?: string;
  bar?: string;
  file?: string;
  unsecured?: string;
}

interface IAppState {
  loading: boolean;
  formData: FormData;
  authError: string | null;
}

const defaultState: IAppState = {
  loading: true,
  formData: {},
  authError: null,
};

class App extends React.Component<Record<string, never>, IAppState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = defaultState;

    onLunaSecAuthError((e: Error) => {
      console.error(e);
      this.setState({ authError: 'Failed to authenticate with LunaSec. \n Is a user logged in?' });
    });

    void this.loadFormData();
  }

  // This kind of works but it creates a grant for the previous token at the moment, because retrieveTokens pulls from sessionstorage.
  //We really need a cleaner way to handle this and to get all of this grant stuff out of this demo app
  // At the very least separate the pulling of tokens from session storage and the turning them into grants into separate functions
  // componentDidUpdate(prevProps: Record<string, any>, prevState: IAppState) {
  // const oldTokens = prevState.tokenIDs;
  // const newTokens = this.state.tokenIDs;
  // const tokenChanged = Object.keys(newTokens).some((tokenName) => {
  //   return newTokens[tokenName as keyof Tokens] !== oldTokens[tokenName as keyof Tokens];
  // });
  // if (tokenChanged) {
  //   void this.retrieveTokens();
  // }
  // }

  handleFooChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    console.log('setting foo', event.target.value);
    this.setState({ formData: { foo: event.target.value } });
  }

  handleBarChange(event: React.ChangeEvent<HTMLInputElement>) {
    console.log('setting bar', event.target.value);
    this.setState({ formData: { bar: event.target.value } });
  }

  handleUploaderChange(tokens: string | Array<string>) {
    console.log('file uploader gave new tokens: ', tokens);
    if (tokens.length === 1) {
      this.setState({ formData: { file: tokens[0] } });
    }
  }

  async loadFormData() {
    const url = new URL('http://localhost:3001/get-form-data');
    const res = await fetch(url.toString());
    const respJson = (await res.json()) as FormData;
    this.setState({ formData: respJson });
    console.log('loaded formdata from server ', this.state.formData);
  }

  async uploadFormData(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await fetch('http://localhost:3001/set-form-data', {
      method: 'POST',
      body: JSON.stringify(this.state.formData),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
  }
  //
  // persistTokens(formEvent: React.FormEvent<HTMLFormElement>) {
  //   formEvent.preventDefault();
  //   window.sessionStorage.setItem('savedTokenIDs', JSON.stringify(this.state.tokenIDs));
  //   window.sessionStorage.setItem('savedFields', JSON.stringify(this.state.fields));
  // }
  //
  // loadFields() {
  //   const dataString = window.sessionStorage.getItem('savedFields');
  //
  //   // fail through to empty object if nothing set
  //   const savedData = JSON.parse(dataString || '{}') as Fields;
  //   this.setState({ fields: savedData });
  // }

  // async retrieveTokens(): Promise<void> {
  //   const dataString = window.sessionStorage.getItem('savedTokenIDs');
  //
  //   // fail through to empty object if nothing set
  //   const savedData = JSON.parse(dataString || '{}') as Tokens;
  //
  //   console.log('retrieved Saved Data of ', savedData);
  //
  //   const tokens: Record<string, string | undefined> = {
  //     foo: savedData.foo,
  //     bar: savedData.bar,
  //     file: savedData.file,
  //   };
  //
  //   // Our libraries expect tokens to come from the server wrapped in a TokenGrant
  //   // Here we simply sign our own tokens into grants so that our libraries can consume them
  //   const resolveTokens = async (tokenGrants: Promise<Record<string, string>>, name: string) => {
  //     const awaitedTokenGrants = await tokenGrants;
  //     const token = tokens[name];
  //     if (token === undefined) {
  //       return {
  //         ...awaitedTokenGrants,
  //         [name]: undefined,
  //       };
  //     }
  //     const tokenGrant = await this.getDetokenizationGrant(token);
  //     if (tokenGrant === undefined) {
  //       throw new Error(`unable to get token grant for: ${token}`);
  //     }
  //     return {
  //       ...awaitedTokenGrants,
  //       [name]: tokenGrant,
  //     };
  //   };
  //
  //   const tokenGrants = await Object.keys(tokens).reduce(resolveTokens.bind(this), Promise.resolve({}));
  //   this.setState({ tokenGrants });
  //   this.setState({ loading: false });
  //
  //   if (this.state.tokenGrants.file !== undefined) {
  //     downloadFile(this.state.tokenGrants.file);
  //   }
  // }
  //
  // async getDetokenizationGrant(tokenId: string) {
  //   const url = new URL('http://localhost:3001/grant');
  //   const params = {
  //     token: tokenId,
  //   };
  //   url.search = new URLSearchParams(params).toString();
  //   const res = await fetch(url.toString());
  //   const respJson: unknown = await res.json();
  //   const resBody = respJson as { grant?: string };
  //   const grant = resBody.grant;
  //   if (grant !== undefined) {
  //     console.log('Loaded detokenization grant for: ' + tokenId + ' - ' + grant);
  //     return grant;
  //   }
  //   console.error('Failed to load detokenization grant for: ' + tokenId);
  //   return undefined;
  // }

  renderFileDownloadComponents(fileTokenGrant: string | undefined) {
    if (!fileTokenGrant) {
      return null;
    }
    return (
      <>
        <section>
          <h3>Secure Download (element)</h3>
          <div>
            <SecureDownload name="securefile.pdf" token={fileTokenGrant} className="test-secure-downloader" />
          </div>
        </section>
        <section>
          <h3>Secure Download (programmatic)</h3>
          <button onClick={() => downloadFile(fileTokenGrant)}>Click to trigger download with JS</button>
        </section>
      </>
    );
  }

  renderFileComponents() {
    const fileTokenGrant = this.state.formData.file;
    return (
      <div>
        {this.renderFileDownloadComponents(fileTokenGrant)}
        <section>
          <h2>Secure Upload</h2>
          <div>
            <SecureUpload
              name="uploader"
              filetokens={fileTokenGrant ? [fileTokenGrant] : undefined}
              onTokenChange={(tokens) => {
                this.handleUploaderChange(tokens);
              }}
            />
          </div>
        </section>
      </div>
    );
  }

  renderForm() {
    // if (this.state.loading) {
    //   return null;
    // }
    return (
      <section>
        {this.state.authError && <p style={{ color: 'red' }}>{this.state.authError}</p>}
        <h2>Secure Form</h2>
        <SecureForm onSubmit={(e) => this.uploadFormData(e)}>
          <SecureTextArea
            name="foo"
            token={this.state.formData.foo}
            onChange={(e) => this.handleFooChange(e)}
            onBlur={(e) => console.log('blur1', e)}
          />
          <SecureInput
            name="bar"
            type="password"
            token={this.state.formData.bar}
            onChange={(e) => this.handleBarChange(e)}
            onBlur={(e) => console.log('blur2', e)}
            placeholder="Enter Your Password"
          />
          <input
            className="d-block"
            name="normal"
            type="text"
            value={this.state.formData.unsecured}
            placeholder="Insecure field coexisting"
            onChange={(e) => this.setState({ formData: { unsecured: e.target.value } })}
            onBlur={(e) => console.log('blur3', e)}
          />
          <input type="submit" />
          <section>
            <h2>Secure Paragraph</h2>
            <div>
              <span>Type in the form above to populate</span>
              <SecureParagraph name="demo-paragraph" className="test-secure-span" />
            </div>
          </section>

          {this.renderFileComponents()}
        </SecureForm>
      </section>
    );
  }

  render() {
    return (
      <div className="App">
        <div className="app-form">{this.renderForm()}</div>
      </div>
    );
  }
}

export default App;
