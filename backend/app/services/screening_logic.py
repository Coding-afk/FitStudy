from typing import Literal

ScreeningOutcome = Literal['eligible', 'warning', 'blocked']


def evaluate_screening(data: dict) -> ScreeningOutcome:
    """Return the study screening outcome for the supplied answers.

    These rules mirror the currently agreed FitStudy screening behaviour:
    - heart condition or medication affecting activity -> blocked
    - injury, pregnancy, or asthma/breathing condition -> warning
    - otherwise -> eligible
    """

    if data.get('heartCondition') == 'yes' or data.get('medication') == 'yes':
        return 'blocked'

    if (
        data.get('injury') == 'yes'
        or data.get('pregnant') == 'yes'
        or data.get('asthma') == 'yes'
    ):
        return 'warning'

    return 'eligible'
