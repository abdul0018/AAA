import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './Reel';
import {ReelProps} from './types';
import props from '../public/props.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel as unknown as React.FC<Record<string, unknown>>}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={900}
    defaultProps={props as unknown as Record<string, unknown>}
    calculateMetadata={({props: p}) => ({durationInFrames: Math.ceil((p as unknown as ReelProps).duration * 30)})}
  />
);
