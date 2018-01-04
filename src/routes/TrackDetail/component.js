/* global AUDIO_BASE */

import React from 'react';
import PropTypes from 'prop-types';
import audio, { load_audio, equalizer } from 'store/audio';
import 'canvas-equalizer/dist/css/CanvasEqualizer.css';
import {
    ControlBar,
    EditWindow,
    Subs,
    WordInfo,
    Downloads,
} from 'components/TrackDetail';
import { demagicize_rects } from 'lib/Util';

const SPACE = ' ';

const chunk_text_nodes = [];
export const get_chunk_text_nodes = () => chunk_text_nodes;
let subs_el;
export const get_subs_el = () => subs_el;

export class TrackDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subs_offset: {
                top: 0,
                left: 0,
            },
        };
    }

    render() {
        const me = this;
        const { locked_for_load, marked_word, stem } = me.props;
        const subs_offset = me.state.subs_offset;
        const subs_props = {
            chunk_text_nodes,
            set_subs_el: (el) => {
                subs_el = el;
            },
            subs_offset,
            ...me.props,
        };

        return (<div>
            {   locked_for_load ?
                <div className='loading-overlay'>
                    <span>Nahrávám, může to trvat i několik minut...</span>
                </div> :
                null
            }
            <h1>{stem}</h1>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-xs-8 col-md-9'>
                        <p />
                        <Subs {...subs_props} />
                    </div>
                    <div className='col-xs-4 col-md-3'>
                        <div className='sidebar'>
                            <WordInfo word={marked_word} stem={stem} />
                            <Downloads stem={stem} />
                            <div className="equalizer"><div
                                style={{ width: '100%', height: '100%' }}
                                ref={el => me.equalizer_el = el}
                            /></div>
                        </div>
                    </div>
                </div>
            </div>
            <ControlBar {...me.props} />
            <EditWindow stem={stem} />
        </div>);
    }
    _is_playing() {
        return this.props.is_playing;
    }
    componentDidMount() {
        const me = this;
        const {
            set_audio_metadata, sync_current_time, set_selection,
            playback_off, playback_on,
            lock_for_load, unlock_after_load,
            stem,
        } = me.props;
        const stub = AUDIO_BASE + stem;
        window.scrollTo(0, 0);
        set_selection();
        const audio_promise = load_audio(stub);
        lock_for_load();
        audio_promise.then(audio => {
            unlock_after_load();
            set_audio_metadata(audio);
            audio.ontimeupdate = sync_current_time;
        });
        if (!window.KEY_PLAYBACK_CTRL) {
            window.KEY_PLAYBACK_CTRL = document.addEventListener(
                'keyup', (evt) => {
                    if (evt.ctrlKey && evt.key === SPACE) {
                        me._is_playing() ? playback_off() : playback_on();
                    }
                },
            );
        }

        me.set_subs_offset();

        me.try_connect_equalizer();
    }

    try_connect_equalizer() {
        const me = this;
        if (me.equalizer_el && me.equalizer_el.getBoundingClientRect().height > 0) {
            equalizer.createControl(me.equalizer_el);
        }
        else {
            requestAnimationFrame(() => me.try_connect_equalizer());
        }
    }

    componentWillUnmount() {
        audio().pause();
    }

    componentDidUpdate() {
        this.set_subs_offset();
    }

    set_subs_offset() {
        const me = this;

        const now = new Date();
        if (me.last_set_subs_offset &&
            now - me.last_set_subs_offset < 1000
        ) {
            return;
        }

        if (!subs_el) {
            return;
        }
        const subs_rects = demagicize_rects(
            subs_el.getClientRects(),
            window.scrollX,
            window.scrollY
        );
        if (subs_rects.length === 0) {
            return;
        }

        const subs_rect = subs_rects[0];
        me.setState({
            subs_offset: {
                top:  subs_rect.abs_y,
                left: subs_rect.abs_x,
            },
        });

        me.last_set_subs_offset = now;
    }
};

TrackDetail.contextTypes = {
    store: PropTypes.object,
};

TrackDetail.propTypes = {
    current_frame:          PropTypes.number,
    current_word:           PropTypes.object,
    failed_word_rectangles: PropTypes.array,
    force_current_frame:    PropTypes.func,
    frame_cnt:              PropTypes.number,
    is_playing:             PropTypes.bool,
    lock_for_load:          PropTypes.func,
    locked_for_load:        PropTypes.bool,
    marked_word:            PropTypes.object,
    playback_off:           PropTypes.func,
    playback_on:            PropTypes.func,
    sending_subs:           PropTypes.bool,
    sent_word_rectangles:   PropTypes.array,
    subs_chunks:            PropTypes.array,
    unlock_after_load:      PropTypes.func,
};

export default TrackDetail;
