import React, { useCallback } from "react"
import PropTypes from "prop-types"
import Select from "components/Select"
import { formatDate } from "utils"
import cn from "classnames"
import StopWatchIcon from "components/shared/StopWatchIcon"

const Form = ({ changeset, errors, projects, onChange, onSubmit }) => {
  const isValid = useCallback(() => {
    return (
      ["assignment_id", "task_id"].map((prop) => changeset[prop]).every(Boolean) &&
      (changeset.date === formatDate(new Date()) || changeset.seconds > 0)
    )
  }, [changeset])

  const isTimerStartable = useCallback(() => {
    return changeset.date === formatDate(new Date()) && changeset.seconds === 0
  }, [changeset])

  const buttonStyle = useCallback(() => {
    const styleMap = {
      true: {
        border: "none",
        borderRadius: "50%",
        width: "60px",
        height: "60px",
        marginTop: "22px",
        transition: "all 0.2s ease-in-out",
      },
      false: {
        border: "none",
        width: "50px",
        height: "36px",
        marginTop: "35px",
        transition: "all 0.2s ease-in-out",
      },
    }

    return styleMap[isTimerStartable()]
  }, [isTimerStartable])

  const handleTextareaKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      if (isValid()) {
        onSubmit(event)
      }
    }
  }

  const project = Select.findOptionByValue(
    projects,
    changeset.mocoProjectId ?? changeset.assignment_id,
  )

  return (
    <form onSubmit={onSubmit}>
      <div
        className={cn("form-group", {
          "has-error": errors.assignment_id || errors.task_id,
        })}
      >
        <Select
          className="moco-bx-select"
          name="assignment_id"
          placeholder="Auswählen..."
          options={projects}
          value={project.value}
          hasError={!!errors.assignment_id}
          onChange={onChange}
        />
        <Select
          className="moco-bx-select"
          name="task_id"
          placeholder="Auswählen..."
          options={project?.tasks || []}
          value={changeset.task_id}
          onChange={onChange}
          hasError={!!errors.task_id}
          noOptionsMessage={() => "Zuerst Projekt wählen"}
        />
        {errors.assignment_id && <div className="form-error">{errors.assignment_id.join(" ")}</div>}
        {errors.task_id && <div className="form-error">{errors.task_id.join(" ")}</div>}
      </div>
      <div className={cn("form-group", { "has-error": errors.hours })}>
        <input
          name="hours"
          className="form-control"
          onChange={onChange}
          value={changeset.hours}
          placeholder="0:00"
          autoComplete="off"
          tabIndex={0}
          autoFocus
        />
        {errors.hours && <div className="form-error">{errors.hours.join(" ")}</div>}
      </div>
      <div className={cn("form-group", { "has-error": errors.description })}>
        <textarea
          name="description"
          onChange={onChange}
          value={changeset.description}
          placeholder="Beschreibung der Tätigkeit – optional"
          maxLength={500}
          rows={3}
          onKeyDown={handleTextareaKeyDown}
        />
        {errors.description && <div className="form-error">{errors.description.join(" ")}</div>}
      </div>

      <button type="submit" className="moco-bx-btn" disabled={!isValid()} style={buttonStyle()}>
        {isTimerStartable() ? <StopWatchIcon /> : "OK"}
      </button>
    </form>
  )
}

Form.propTypes = {
  changeset: PropTypes.shape({
    assignment_id: PropTypes.number.isRequired,
    billable: PropTypes.bool.isRequired,
    date: PropTypes.string.isRequired,
    task_id: PropTypes.number.isRequired,
    description: PropTypes.string,
    mocoProjectId: PropTypes.number,
    remote_id: PropTypes.string,
    remote_service: PropTypes.string,
    remote_url: PropTypes.string,
    seconds: PropTypes.number,
    hours: PropTypes.string,
  }).isRequired,
  errors: PropTypes.object,
  projects: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default Form
