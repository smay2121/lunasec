import React, { Component, CSSProperties } from 'react';

import { RenderData, WrappedComponentProps } from '../../types';
type InputRenderData = RenderData<HTMLInputElement>;
export type InputProps = WrappedComponentProps<'input'>;

export default class Span extends Component<InputProps> {
  constructor(props: InputProps) {
    super(props);
  }

  componentDidMount() {
    this.props.renderData.mountedCallback();
  }

  renderFrame(renderData: InputRenderData) {
    if (!renderData.frameStyleInfo) {
      return null;
    }
    const { width, ...frameStyle } = renderData.frameStyleInfo;
    return (
      <iframe
        ref={renderData.frameRef}
        src={renderData.frameUrl}
        style={frameStyle}
        frameBorder={0}
        key={renderData.frameUrl}
      />
    );
  }

  render() {
    const renderData = this.props.renderData;
    const { value, children, ...otherProps } = this.props;

    const parentContainerStyle: CSSProperties = {
      position: 'relative',
      display: 'block',
    };

    const isRendered = this.state.frameStyleInfo !== undefined;

    const hiddenInputStyle: CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      // We can't set the "visibility" to "collapsed" or "hidden",
      // Or else the "on focus" and "on blur" events won't fire.
      // So we use zIndex instead to "hide" the input.
      zIndex: isRendered ? -1 : 1,
      opacity: isRendered ? 0 : 1,
      display: 'block',
      resize: 'none',
    };

    const inputClassName = this.props.className !== undefined ? this.props.className : '';

    const dummyElementProps = {
      ...otherProps,
      className: isRendered ? `secure-form-input--hidden ${inputClassName}` : `${inputClassName}`,
      // TODO: support setting type to the passed prop to catch all possible style selectors, rare case
      type: 'text',
      ref: renderData.dummyRef,
      name: this.props.name,
      defaultValue: isRendered ? this.props.value : '',
      style: { ...this.props.style, ...hiddenInputStyle },
      onChange: isRendered ? this.props.onChange : undefined,
      onBlur: this.props.onBlur,
      onFocus: this.props.onFocus,
    };

    return (
      <div
        className={`secure-form-container-${this.frameId} secure-form-container-${this.props.name}`}
        style={parentContainerStyle}
      >
        {this.renderHiddenElement(dummyElementProps)}

        {this.renderFrame()}
      </div>
    );
  }
}
