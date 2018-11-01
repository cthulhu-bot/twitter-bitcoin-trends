import React, { Component } from "react";
import "./App.css";
import {
  VictoryLine,
  VictoryLabel,
  VictoryChart,
  VictoryZoomContainer
} from "victory";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tweets: [],
      bitcoinPrices: [],
      zoomDomain: { x: [new Date(2018, 8, 28), new Date(2018, 8, 31)] }
    };
  }

  componentDidMount() {
    fetch("/tweets")
      .then(resp => resp.json())
      .then(result => {
        this.setState({
          tweets: result
        });
      });
    fetch("/btc")
      .then(resp => resp.json())
      .then(result => {
        this.setState({
          bitcoinPrices: result
        });
      });
  }

  handleZoom(domain) {
    this.setState({ zoomDomain: domain });
  }

  render() {
    const styles = this.getStyles();
    const tweetData = this.getTweetData();
    const priceData = this.getBTCPriceData();

    return (
      <div>
        <VictoryLabel
          x={25}
          y={24}
          style={styles.title}
          text="Number of bitcoin tweets per hour"
        />
        <VictoryChart
          width={600}
          height={350}
          scale={{ x: "time" }}
          containerComponent={
            <VictoryZoomContainer
              zoomDimension="x"
              zoomDomain={this.state.zoomDomain}
              onZoomDomainChange={this.handleZoom.bind(this)}
            />
          }
        >
          <VictoryLine
            style={{
              data: { stroke: "tomato" }
            }}
            data={tweetData}
          />
        </VictoryChart>

        <VictoryLabel
          x={25}
          y={24}
          style={styles.title}
          text="Price of bitcoin (USD)"
        />
        <VictoryChart
          width={600}
          height={350}
          scale={{ x: "time" }}
          containerComponent={
            <VictoryZoomContainer
              zoomDimension="x"
              zoomDomain={this.state.zoomDomain}
              onZoomDomainChange={this.handleZoom.bind(this)}
            />
          }
        >
          <VictoryLine
            style={{
              data: { stroke: "tomato" }
            }}
            data={priceData}
          />
        </VictoryChart>
      </div>
    );
  }

  getTweetData() {
    return Object.keys(this.state.tweets).reduce((acc, tweet) => {
      acc.push({ x: new Date(JSON.parse(tweet)), y: this.state.tweets[tweet] });
      return acc;
    }, []);
  }

  getBTCPriceData() {
    return this.state.bitcoinPrices.reduce((acc, price) => {
      const convertedTime = new Date(price.time * 1000);
      acc.push({ x: convertedTime, y: price.close });
      return acc;
    }, []);
  }

  getStyles() {
    return {
      title: {
        textAnchor: "start",
        verticalAnchor: "end",
        fill: "#000000",
        fontFamily: "inherit",
        fontSize: "18px",
        fontWeight: "bold"
      }
    };
  }
}

export default App;
