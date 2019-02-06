import React, { Component } from "react"
import PropTypes from "prop-types"
import ReactSelect, { createFilter } from "react-select"
import {
  values,
  isString,
  isNumber,
  join,
  filter,
  compose,
  property
} from "lodash/fp"

const customTheme = theme => ({
  ...theme,
  borderRadius: 0,
  spacing: {
    ...theme.spacing,
    baseUnit: 2,
    controlHeight: 34
  }
})

const customStyles = {
  groupHeading: (base, _state) => ({
    ...base,
    color: "black",
    textTransform: "none",
    fontWeight: "bold",
    fontSize: "100%"
  })
}

const filterOption = createFilter({
  stringify: compose(
    join(" "),
    filter(value => isString(value) || isNumber(value)),
    values,
    property("data")
  )
})

export default class Select extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  handleChange = value => {
    const { name, onChange } = this.props
    onChange({ target: { name, value } })
  }

  render() {
    const passThroughProps = this.props
    return (
      <ReactSelect
        {...passThroughProps}
        onChange={this.handleChange}
        filterOption={filterOption}
        theme={customTheme}
        styles={customStyles}
      />
    )
  }
}
