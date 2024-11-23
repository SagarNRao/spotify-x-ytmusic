"use client"

import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { onTogglePlay } from '@/public/spotless/popup/src/actions/player';


const Popup = () => {
  return (
    <div style={{ padding: '20px', width: '300px' }}>
      <h1>My Extension Popup</h1>
      <button
        className="control-button"
        onClick={onTogglePlay}
      >aaaa why is the css not loading</button>
    </div>
  );
};

export default Popup;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const mapStateToProps = (state: any) => ({
//   playing: () => state.player.playback.is_playing,
// });

// const mapDispatchToProps = (dispatch: Dispatch) => ({
//   onTogglePlay: () => dispatch(onTogglePlay() as never),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(Popup);