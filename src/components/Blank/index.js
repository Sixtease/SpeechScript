import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { set_audio_metadata } from '../../routes/TrackDetail/module/action-creators';
import { set_encoded_audio, set_subs } from './action-creators';
import Blank from './component';
import './style.scss';

const map_dispatch_to_props = {
  set_audio_metadata,
  set_encoded_audio,
  set_subs,
};

const map_state_to_props = state => ({});

export default connect(
  map_state_to_props,
  map_dispatch_to_props,
)(withRouter(Blank));
