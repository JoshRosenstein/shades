// @flow
import React, { Component, type Node } from 'react';
import PropTypes from 'prop-types';

type RenderFn<T> = (value: T) => Node;

export type ProviderProps<T> = {
  value: T,
  children?: Node
};

export type ConsumerProps<T> = {
  children: RenderFn<T> | [RenderFn<T>]
};

export type ConsumerState<T> = {
  value: T
};

export type Provider<T> = Component<ProviderProps<T>>;
export type Consumer<T> = Component<ConsumerProps<T>, ConsumerState<T>>;

export type Context<T> = {
  Provider: Class<Provider<T>>,
  Consumer: Class<Consumer<T>>
};

function onlyChild(children): any {
  return Array.isArray(children) ? children[0] : children;
}

let contextCounter = 0;

function createReactContext<T>(
  defaultValue: T
): Context<T> {
  contextCounter = contextCounter + 1;

  const contextProp = `reactContext_${contextCounter}`;

  class Provider extends Component<ProviderProps<T>> {
    static childContextTypes = {
      [contextProp]: PropTypes.object.isRequired
    };

    getChildContext() {
      return {
        [contextProp]: this.props.value
      };
    }

    render() {
      console.log('provider renders', this.props.children, this.props.value)
      return this.props.children;
    }
  }

  class Consumer extends Component<ConsumerProps<T>, ConsumerState<T>> {
    static contextTypes = {
      [contextProp]: PropTypes.object
    };

    state: ConsumerState<T> = {
      value: this.getValue()
    };

    getValue(): T {
      if (this.context[contextProp]) {
        return this.context[contextProp];
      } else {
        return defaultValue;
      }
    }

    render() {
      console.log('consumer receives', this.context, this.state.value);
      const output = onlyChild(this.props.children)(this.state.value);
      console.log(output)
      return output;
    }
  }

  return {
    Provider,
    Consumer
  };
}

const currentEnv = process?.env?.NODE_ENV;
const isTestEnv = currentEnv === 'test';

const mockedCreateContext = isTestEnv && createReactContext;

console.log({ currentEnv, isTestEnv })

export default (mockedCreateContext || React.createContext);
