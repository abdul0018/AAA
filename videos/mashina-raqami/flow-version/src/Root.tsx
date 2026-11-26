import React from 'react';
import {Composition} from 'remotion';
import {FlowReel, type FlowProps} from './FlowReel';
const ph: FlowProps = {words: [], handle: '@yourhandle', end: 2, shots: [], tracks: {}};
export const RemotionRoot: React.FC = () => (
  <Composition id="FlowReel" component={FlowReel} width={1080} height={1920} fps={30} durationInFrames={60} defaultProps={ph}
    calculateMetadata={({props}) => ({durationInFrames: Math.ceil((props as unknown as FlowProps).end * 30)})} />
);
