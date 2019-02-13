import React, { Component } from "react"
import PropTypes from "prop-types"
import Select from "components/Select"

class Form extends Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    changeset: PropTypes.shape({
      project: PropTypes.object,
      task: PropTypes.object,
      hours: PropTypes.string
    }).isRequired,
    projects: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  };

  static defaultProps = {
    inline: true
  };

  isValid = () => {
    const { changeset } = this.props
    return ["assignment_id", "task_id", "hours", "description"]
      .map(prop => changeset[prop])
      .every(Boolean)
  };

  // RENDER -------------------------------------------------------------------

  render() {
    if (this.isLoading) {
      return null
    }

    const { projects, changeset, onChange, onSubmit } = this.props
    const project = Select.findOptionByValue(projects, changeset.assignment_id)

    return (
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <Select
            name="assignment_id"
            options={projects}
            value={changeset.assignment_id}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <Select
            name="task_id"
            options={project?.tasks || []}
            value={changeset.task_id}
            onChange={onChange}
            noOptionsMessage={() => "Zuerst Projekt wählen"}
          />
        </div>
        <div className="form-group">
          <input
            name="hours"
            className="form-control"
            onChange={onChange}
            value={changeset.hours}
            placeholder="0.00 h"
            autoComplete="off"
            autoFocus
          />
        </div>
        <div className="form-group">
          <textarea
            name="description"
            onChange={onChange}
            value={changeset.description}
            placeholder="Beschreibung der Tätigkeit - mind. 3 Zeichen"
            rows={4}
          />
        </div>

        <button disabled={!this.isValid()}>Speichern</button>
      </form>
    )
  }
}

export default Form
