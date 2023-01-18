import * as React from "react";
import { Link } from "react-router-dom";
import Unibeautify, { Language, BeautifyData } from "unibeautify";
import * as CodeMirror from "react-codemirror";
import Form, { FormProps, IChangeEvent } from "react-jsonschema-form";
import * as LZString from "lz-string";
import { History } from "history";
import * as GitHubButton from "react-github-button";
import * as CopyToClipboard from "react-copy-to-clipboard";

require("codemirror/lib/codemirror.css");
require("codemirror/mode/javascript/javascript");
require("react-github-button/assets/style.css");

import ApiClient, { SupportResponse } from "./ApiClient";
import { Playground } from "./Playground";
import { homepage } from "../package.json";
import { ReportIssueButton } from "./ReportIssueButton";
import { Nav } from "./Nav";

const apiUrl: string =
  "https://z446o1y0w8.execute-api.us-east-1.amazonaws.com/prod/playground";

(window as any).Unibeautify = Unibeautify;

export class Container extends React.Component<ContainerProps, ContainerState> {
  private readonly client: ApiClient;

  constructor(props: any) {
    super(props);
    this.client = new ApiClient(apiUrl);
  }

  state: ContainerState = {
    status: ContainerStatus.Init,
    support: undefined,
  };

  private get stateFromUri(): object {
    const hash = this.locationHash;
    const json = LZString.decompressFromEncodedURIComponent(hash);
    try {
      const payload = JSON.parse(json as string) || {};
      console.log("loaded state", payload);
      return payload;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  private get locationHash(): string {
    return this.history.location.hash.slice(1);
  }

  private get history(): History {
    return (this.props as any).history;
  }

  public componentDidMount() {
    console.log("componentDidMount");
    this.loadSupport();
  }

  public componentWillUnmount() {
    console.log("componentWillUnmount");
  }

  private loadSupport() {
    return this.client.support().then(support => {
      console.log("Support", support);
      this.setState(prevState => ({
        ...prevState,
        status: ContainerStatus.SupportLoaded,
        support,
      }));
    });
  }

  public render() {
    if (!this.state.support) {
      return <div className="">Loading...</div>;
    }

    return (
      <Playground
        client={this.client}
        support={this.state.support}
        defaultState={this.stateFromUri}
        replaceHash={this.replaceHash}
      />
    );
  }

  private setStatus(newStatus: ContainerStatus): void {
    this.setState(prevState => ({
      ...prevState,
      status: newStatus,
    }));
  }

  private replaceHash = (hash: string) => {
    this.history.replace(`/#${hash}`);
  };
}

interface ContainerProps {}

interface ContainerState {
  status: ContainerStatus;
  support?: SupportResponse;
}

enum ContainerStatus {
  Init,
  LoadingSupport,
  SupportLoaded,
  BeautifierError,
  OptionsError,
  Sending,
  Beautified,
}
