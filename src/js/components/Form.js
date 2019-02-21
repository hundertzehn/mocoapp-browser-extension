import React, { Component } from "react"
import PropTypes from "prop-types"
import Select from "components/Select"
import cn from "classnames"

class Form extends Component {
  static propTypes = {
    changeset: PropTypes.shape({
      project: PropTypes.object,
      task: PropTypes.object,
      hours: PropTypes.string
    }).isRequired,
    errors: PropTypes.object,
    projects: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  };

  static defaultProps = {
    inline: true
  };

  isValid = () => {
    const { changeset } = this.props
    return ["assignment_id", "task_id", "description"]
      .map(prop => changeset[prop])
      .every(Boolean)
  };

  // RENDER -------------------------------------------------------------------

  render() {
    const { projects, changeset, errors, onChange, onSubmit } = this.props
    const project = Select.findOptionByValue(projects, changeset.assignment_id)

    return (
      <form onSubmit={onSubmit}>
        <div
          className={cn("form-group", { "has-error": errors.assignment_id })}
        >
          <Select
            name="assignment_id"
            options={projects}
            value={changeset.assignment_id}
            hasError={!!errors.assignment_id}
            onChange={onChange}
          />
          {errors.assignment_id ? (
            <div className="form-error">{errors.assignment_id.join("; ")}</div>
          ) : null}
        </div>
        <div className={cn("form-group", { "has-error": errors.task_id })}>
          <Select
            name="task_id"
            options={project?.tasks || []}
            value={changeset.task_id}
            onChange={onChange}
            hasError={!!errors.task_id}
            noOptionsMessage={() => "Zuerst Projekt wählen"}
          />
          {errors.task_id ? (
            <div className="form-error">{errors.task_id.join("; ")}</div>
          ) : null}
        </div>
        <div className={cn("form-group", { "has-error": errors.hours })}>
          <input
            name="hours"
            className="form-control"
            onChange={onChange}
            value={changeset.hours}
            placeholder="0:00"
            autoComplete="off"
            autoFocus
          />
          &nbsp;&nbsp;<span className="text-muted">Leer lassen, um Timer zu starten</span>
          {errors.hours ? (
            <div className="form-error">{errors.hours.join("; ")}</div>
          ) : null}
        </div>
        <div className={cn("form-group", { "has-error": errors.description })}>
          <textarea
            name="description"
            onChange={onChange}
            value={changeset.description}
            placeholder="Beschreibung der Tätigkeit - mind. 3 Zeichen"
            rows={4}
          />
          {errors.description ? (
            <div className="form-error">{errors.description.join("; ")}</div>
          ) : null}
        </div>

        <button disabled={!this.isValid()}>Speichern</button>
        <button type="button" className="secondary" onClick={this.props.onCancel}>Abbrechen</button>
      </form>
    )
  }
}

export default Form
