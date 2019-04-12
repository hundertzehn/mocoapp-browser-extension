import React, { Component } from "react"
import PropTypes from "prop-types"
import ReactSelect, { createFilter, components } from "react-select"
import {
  values,
  isString,
  isNumber,
  join,
  filter,
  compose,
  property,
  flatMap,
  pathEq,
  isNil,
} from "lodash/fp"

const hasOptionGroups = options => options.some(option => Boolean(option.options))

const customTheme = theme => ({
  ...theme,
  borderRadius: 0,
  spacing: {
    ...theme.spacing,
    baseUnit: 3,
    controlHeight: 32,
  },
  colors: {
    ...theme.colors,
    primary: "#38b5eb",
    primary75: "rgba(56, 181, 235, 0.25)",
    primary50: "#38b5eb",
    primary25: "#38b5eb",
  },
})

const customStyles = props => ({
  control: (base, _state) => ({
    ...base,
    borderColor: props.hasError ? "#FB3A2F" : base.borderColor,
  }),
  valueContainer: base => ({
    ...base,
    padding: "4px 12px",
  }),
  input: base => ({
    ...base,
    border: "0 !important",
    boxShadow: "0 !important",
  }),
  groupHeading: (base, _state) => ({
    ...base,
    color: "black",
    textTransform: "none",
    fontWeight: "bold",
    fontSize: "100%",
    padding: "2px 7px 4px",
  }),
  option: (base, state) => ({
    ...base,
    padding: hasOptionGroups(state.options) ? "4px 7px 4px 20px" : "4px 7px 4px",
    backgroundColor: state.isFocused ? "#38b5eb" : "none",
    color: state.isFocused ? "white" : "hsl(0, 0%, 20%)",
  }),
})

const filterOption = createFilter({
  stringify: compose(
    join(" "),
    filter(value => isString(value) || isNumber(value)),
    values,
    property("data"),
  ),
})

SingleValue.propTypes = {
  children: PropTypes.string.isRequired,
  data: PropTypes.shape({
    customerName: PropTypes.string,
  }).isRequired,
}

function SingleValue({ children, ...props }) {
  const label = isNil(props.data.customerName)
    ? children
    : `${props.data.customerName}: ${children}`
  return <components.SingleValue {...props}>{label}</components.SingleValue>
}

export default class Select extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    options: PropTypes.array,
    hasError: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  }

  static findOptionByValue = (selectOptions, value) => {
    const options = flatMap(option => (option.options ? option.options : option), selectOptions)

    return options.find(pathEq("value", value)) || null
  }

  constructor(props) {
    super(props)
    this.select = React.createRef()
  }

  handleChange = option => {
    const { name, onChange } = this.props
    const { value } = option
    onChange({ target: { name, value } })
  }

  handleKeyDown = event => {
    if (!this.select.current) {
      return
    }

    if (!this.select.current.state.menuIsOpen && event.key === "Enter") {
      this.select.current.setState({ menuIsOpen: true })
    }
  }

  render() {
    const { value, ...passThroughProps } = this.props

    return (
      <ReactSelect
        {...passThroughProps}
        ref={this.select}
        value={Select.findOptionByValue(this.props.options, value)}
        filterOption={filterOption}
        theme={customTheme}
        styles={customStyles(this.props)}
        components={{ SingleValue }}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
      />
    )
  }
}
