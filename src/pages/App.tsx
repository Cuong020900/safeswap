import React, {Suspense, useCallback, useEffect} from 'react'
import {HashRouter, Route, Switch} from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Header from '../components/Header'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import AddLiquidity from './AddLiquidity'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity
} from './AddLiquidity/redirects'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import {RedirectOldRemoveLiquidityPathStructure} from './RemoveLiquidity/redirects'
import Swap from './Swap'
import {RedirectPathToSwapOnly, RedirectToSwap} from './Swap/redirects'
import {ethers} from "ethers";
import {useGasPrices, useGasType} from "../state/user/hooks";
import {useDispatch} from "react-redux";
import {updateGasPrice, updateGasPricesList} from "../state/user/actions";
import axios from 'axios';
import {useActiveWeb3React} from "../hooks";
import {BigNumber} from "@ethersproject/bignumber";
import {ChainId} from "@safemoon/sdk";

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 160px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      padding: 16px;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

export default function App() {
  const gasPrices = useGasPrices();
  const gasType = useGasType();
  const dispatch = useDispatch();

  const getEthGasPrice = useCallback(async () => {
    try {
      const res = await axios.get('https://ethgasstation.info/api/ethgasAPI.json')
      const ethGasPrices = {
        default: BigNumber.from(res?.data?.average).mul(10 ** 8).toString(),
        fast: BigNumber.from(res?.data?.fast).mul(10 ** 8).toString(),
        instant: BigNumber.from(res?.data?.fastest).mul(10 ** 8).toString(),
        testnet: BigNumber.from(res?.data?.safeLow).mul(10 ** 8).toString(),
      }

      dispatch(updateGasPricesList({ gasPrices: ethGasPrices, chainId: ChainId.MAINNET }))
    } catch(e) {
      console.log(e);
    }
  }, [dispatch])

  useEffect(() => {
    if(window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      provider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) {
          dispatch(updateGasPrice({ gasPrice: gasPrices[gasType], gasPriceType: gasType }))
          window.location.reload();
        }
      });
    }


  }, [])

  useEffect(() => {
    getEthGasPrice();
  }, [])
  return (
    <Suspense fallback={null}>
      <HashRouter>
        <Route component={GoogleAnalyticsReporter} />
        <Route component={DarkModeQueryParamReader} />
        <AppWrapper>
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <BodyWrapper>
            <Popups />
            <Web3ReactManager>
              <Switch>
                <Route exact strict path="/swap" component={Swap} />
                <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
                <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
                <Route exact strict path="/find" component={PoolFinder} />
                <Route exact strict path="/pool" component={Pool} />
                <Route exact strict path="/create" component={RedirectToAddLiquidity} />
                <Route exact path="/add" component={AddLiquidity} />
                <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
                <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                <Route component={RedirectPathToSwapOnly} />
              </Switch>
            </Web3ReactManager>
            <Marginer />
          </BodyWrapper>
        </AppWrapper>
      </HashRouter>
    </Suspense>

  )
}
