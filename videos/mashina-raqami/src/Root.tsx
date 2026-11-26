import React from 'react';
import {Composition} from 'remotion';
import {PlatesReel, type PlatesProps} from './PlatesReel';
const ph: PlatesProps = {words: [], handle: '@yourhandle', end: 2};
export const RemotionRoot: React.FC = () => (
  <Composition id="PlatesReel" component={PlatesReel} width={1080} height={1920} fps={30} durationInFrames={60} defaultProps={ph}
    calculateMetadata={({props}) => ({durationInFrames: Math.ceil((props as unknown as PlatesProps).end * 30)})} />
);
