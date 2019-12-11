import * as FormField from 'front-end/lib/components/form-field';
import Select, { coalesceOptions, Option, Options, Props as SelectProps, Value } from 'front-end/lib/components/form-field/lib/select';
import SelectCreatable from 'front-end/lib/components/form-field/lib/select-creatable';
import { Immutable, Init, Update } from 'front-end/lib/framework';
import { find } from 'lodash';
import React from 'react';
import { ADT } from 'shared/lib/types';

export { Options, OptionGroup, Option, Value } from 'front-end/lib/components/form-field/lib/select';

interface ChildState extends FormField.ChildStateBase<Value> {
  options: Options;
  creatable?: boolean;
  formatGroupLabel?: SelectProps['formatGroupLabel'];
}

type ChildParams = FormField.ChildParamsBase<Value> & Pick<ChildState, 'options' | 'creatable' | 'formatGroupLabel'>;

export type State = FormField.State<Value, ChildState>;

export type Params = FormField.Params<Value, ChildParams>;

type InnerChildMsg
  = ADT<'onChange', Value>;

export type Msg = FormField.Msg<InnerChildMsg>;

const childInit: Init<ChildParams, ChildState> = async params => params;

const childUpdate: Update<ChildState, FormField.ChildMsg<InnerChildMsg>> = ({ state, msg }) => {
  switch (msg.tag) {
    case 'onChange':
      return [state.set('value', msg.value)];
    default:
      return [state];
  }
};

const ChildView: FormField.ChildView<Value, ChildState, InnerChildMsg> = props => {
  const { state, dispatch, placeholder = '', className = '', validityClassName, disabled = false } = props;
  const selectProps: SelectProps = {
    name: state.id,
    id: state.id,
    placeholder,
    value: state.value,
    disabled,
    options: state.options,
    className: `${className} ${validityClassName}`,
    onChange: value => {
      dispatch({ tag: 'onChange', value });
      // Let the parent form field component know that the value has been updated.
      props.onChange(value);
    },
    formatGroupLabel: state.formatGroupLabel
  };
  return state.creatable ? (<SelectCreatable {...selectProps} />) : (<Select {...selectProps} />);
};

export const component = FormField.makeComponent({
  init: childInit,
  update: childUpdate,
  view: ChildView
});

export const init = component.init;

export const update = component.update;

export const view = component.view;

export default component;

export function setValueFromString(state: Immutable<ChildState>, value?: string): Immutable<ChildState> {
  const options = coalesceOptions(state.options);
  const found: Option | null = find(options, { value }) || null;
  if (state.creatable && !found && value) {
    return {
      ...state,
      value: {
        value,
        label: value
      }
    };
  } else {
    return {
      ...state,
      value: found
    };
  }
}
