import React, { Fragment } from "react";
import { SingleInput } from "../SingleInput";
import "./Name-Room-Input.css";

export const NameInput = props => {
  const { playerNameConfirmed, isChangingName, playerName } = props;
  let inputClass = playerNameConfirmed ? "name" : "no-name";
  inputClass +=
    playerName && playerName.trim() !== playerNameConfirmed
      ? " valid"
      : " invalid";
  const containerClass =
    "input-container input-container-name " +
    (playerNameConfirmed ? "name" : "no-name");
  const formClass = "input-form " + (playerNameConfirmed ? "name" : "no-name");
  return (
    <div className={containerClass}>
      {isChangingName ? (
        <Fragment>
          {playerNameConfirmed && (
            <div className="name-text">
              What name would you like <strong>{playerNameConfirmed}</strong>?
            </div>
          )}
          <form onSubmit={props.handlePlayerNameSubmit} className={formClass}>
            <SingleInput
              classes={inputClass}
              title="Player Name"
              name="name"
              controlFunc={props.handlePlayerNameChange}
              content={props.playerName}
              placeholder={"Enter a name!"}
            />
            {playerNameConfirmed !== "" && (
              <button
                type="button"
                className="name-input-button discard invalid"
                onClick={props.handleIsChangeNameFalse}
              >
                Discard Changes
              </button>
            )}
          </form>
        </Fragment>
      ) : (
        <Fragment>
          <div className="name-text">
            Welcome <strong>{playerNameConfirmed || "Unnamed Player"}</strong>
          </div>
          <div className="input-form">
            <button
              className="name-input-button"
              onClick={props.handleIsChangeName}
            >
              Change Name
            </button>
          </div>
        </Fragment>
      )}
    </div>
  );
};
