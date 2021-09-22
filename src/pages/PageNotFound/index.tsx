import React from 'react'
import "./style.css"
import {useTranslation} from "react-i18next";

export default function PageNotFound() {
  const { t } = useTranslation()
  return (
    <div className="container">
      <div className="night">
        <div className="text">{t('pageNotFound')}<br/><span>404</span></div>
        <span className="moon" />
        <span className="spot1" />
        <span className="spot2" />
        <ul>
          <li />
          <li />
          <li />
          <li />
          <li />
        </ul>
      </div>
    </div>
  )
}
