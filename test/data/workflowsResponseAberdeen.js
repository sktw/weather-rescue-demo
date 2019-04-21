export default {
    "id": "10644",
    "display_name": "ABERDEEN-3",
    "tasks": {
        "T1": {
            "help": "",
            "next": "T2",
            "type": "text",
            "required": false,
            "instruction": "Enter **dry bulb temperature** (third column):"
        },
        "T3": {
            "next": "T8",
            "type": "combo",
            "tasks": [
                "T7",
                "T1",
                "T5",
                "T9",
                "T10",
                "T6"
            ]
        },
        "T5": {
            "help": "",
            "type": "text",
            "required": false,
            "instruction": "Enter **wet bulb temperature** (fourth column):"
        },
        "T6": {
            "help": "**Please enter the required data from the weather report image into the corresponding boxes on the right hand side of the screen.**\n\nEach image contains readings from multiple locations from around the UK and western Europe – the locations are all listed down the left hand side. The columns correspond to the different measurements made.\n\nFor each task, you will be assigned a location. Enter the values from that row. \n\nThe first column contains the barometer reading of atmospheric pressure (measured in inches of mercury), usually beginning with 28, 29 or 30.\n\nThere are several columns for temperature readings - including dry bulb, wet bulb, maximum and minimum - measured in Fahrenheit. \n\nThere is also a column for rainfall measured in inches, with a long hyphen (-) representing no rain.\n\nPlease enter the figures from these columns for the location requested into the three separate text boxes. \n\nPlease ignore any extra annotations that occasionally appear written in pencil. \n![pencil_example.jpg](https://panoptes-uploads.zooniverse.org/production/project_attached_image/3f3166e3-629c-43ef-b284-8bc2697c9a4e.jpeg)\n\nDo include any question marks (?) that appear (e.g. ?60).\n![question_example.jpg](https://panoptes-uploads.zooniverse.org/production/project_attached_image/aa31ab6b-7c3e-4fed-bc8d-31c7fa32f8e3.jpeg)\n\nIs there something interesting or confusing about the image? Complete the boxes as you think best and click 'Done & Talk' to discuss the image with the project team and other volunteers.\n\nIf you are not sure about a value then type what you think is right. More than one volunteer is looking at each value so we can detect which values are unclear or if occasional errors are made.\n\nNeed more help? Try the tutorial or 'Talk' section of the website.",
            "type": "text",
            "required": false,
            "instruction": "Enter **rainfall** reading (column near right hand side of page)\n**NOTE**: enter a hyphen (-) if that is what is written."
        },
        "T7": {
            "help": "",
            "type": "text",
            "required": false,
            "instruction": "Please enter data for **ABERDEEN**.\n\nIf a value is missing for one or more of the columns, leave the corresponding box blank. Include ‘?’ symbols if they are written.\n\nEnter **pressure** (first column):\n(**NOTE:** ignore any extra symbols after the value)"
        },
        "T9": {
            "help": "",
            "type": "text",
            "required": false,
            "instruction": "Enter **maximum temperature** (sixth column)"
        },
        "T10": {
            "help": "",
            "type": "text",
            "required": false,
            "instruction": "Enter **minimum temperature** (seventh column)"
        }
    },
    "steps": {},
    "classifications_count": 1472,
    "subjects_count": 350,
    "created_at": "2019-04-14T10:03:10.134Z",
    "updated_at": "2019-04-16T10:11:48.584Z",
    "finished_at": null,
    "first_task": "T3",
    "primary_language": "en",
    "version": "25.25",
    "content_language": "en",
    "prioritized": false,
    "grouped": false,
    "pairwise": false,
    "retirement": {
        "options": {
            "count": 7
        },
        "criteria": "classification_count"
    },
    "retired_set_member_subjects_count": 15,
    "href": "/workflows/10644",
    "active": true,
    "mobile_friendly": false,
    "aggregation": {},
    "configuration": {
        "image_layout": [
            "no-max-height"
        ],
        "pan_and_zoom": true,
        "stats_hidden": true,
        "invert_subject": true,
        "persist_annotations": true,
        "versions_backfilled": true,
        "stats_completeness_type": "classification",
        "hide_classification_summaries": true
    },
    "public_gold_standard": false,
    "completeness": 0.0428571428571429,
    "links": {
        "project": "7859",
        "subject_sets": [
            "74881",
            "74883"
        ],
        "tutorial_subject": null,
        "published_version": null,
        "attached_images": {
            "href": "/workflows/10644/attached_images",
            "type": "attached_images",
            "ids": []
        },
        "classifications_export": {
            "href": "/workflows/10644/classifications_export",
            "type": "classifications_exports"
        }
    }
};
