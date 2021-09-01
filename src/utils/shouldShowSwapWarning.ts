import warningTokens from '../constants/token/warningTokens'

export const shouldShowSwapWarning = (swapCurrency: any) => {
  console.log(swapCurrency)
  const isWarningToken = Object.entries(warningTokens).find(warningTokenConfig => {
    const warningTokenData = warningTokenConfig[1]
    const warningTokenAddress = warningTokenData.address
    return swapCurrency.address === warningTokenAddress
  })
  return Boolean(isWarningToken)
}
