import React from 'react';
export const SingleInput = (props) => {
  let inputClass = 'single-input-text-box';
  let submitClass = 'single-input-submit-button';
  let submitText = props.submitText || 'Submit';
  if (props.classes) {
    inputClass += ' ' + props.classes;
    submitClass += ' ' + props.classes;
  }
  return (
        <React.Fragment>
          <input name={props.name} type="text" value={props.content} onChange={props.controlFunc} placeholder={props.placeholder} className={inputClass} autoComplete='off' maxLength={30} />
          <input type="submit" value={submitText} className={submitClass} />
        </React.Fragment>
    );
};