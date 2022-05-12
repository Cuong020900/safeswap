import React, { Component } from 'react'
import './SwitchField.css'

export default class SwitchField extends Component<any> {
  handleChange = ({ active }) => e => {
    e.stopPropagation()
    const { onChange } = this.props
    onChange(active)
  }

  render() {
    const { value } = this.props

    return (
      <div className={'wrapper'}>
        {value ? (
          <span onClick={this.handleChange({ active: false })}>
            <span className={'active switch'} />
          </span>
        ) : (
          <span onClick={this.handleChange({ active: true })}>
            <span className={'inActive switch'} />
          </span>
        )}
      </div>
    )
  }
}
