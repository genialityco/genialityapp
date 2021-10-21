import React from 'react'
import WithEviusContext from '../../../Context/withContext';

const ImageComponent = (props) => {
    return (
        <div className="column is-centered mediaplayer">
            <img
                className="activity_image"
                style={{
                    width: "100%",
                    height: "60vh",
                    objectFit: "cover",
                }}
                src={
                    props.cEvent.value.styles?.banner_image
                        ? props.cEvent.value.styles?.banner_image
                        : currentActivity?.image
                            ? currentActivity?.image
                            : props.cEvent.value.styles.event_image
                                ? props.cEvent.value.styles.event_image
                                : imagePlaceHolder
                }
                alt="Activity"
            />
        </div>
    )
}

let ImageComponentwithContext = WithEviusContext(ImageComponent);
export default ImageComponentwithContext;