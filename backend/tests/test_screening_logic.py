from app.services.screening_logic import evaluate_screening


def base_answers():
    return {
        'heartCondition': 'no',
        'injury': 'no',
        'pregnant': 'no',
        'asthma': 'no',
        'medication': 'no',
    }


def test_clear_screening_is_eligible():
    assert evaluate_screening(base_answers()) == 'eligible'


def test_heart_condition_is_blocked():
    data = base_answers()
    data['heartCondition'] = 'yes'
    assert evaluate_screening(data) == 'blocked'


def test_medication_is_blocked():
    data = base_answers()
    data['medication'] = 'yes'
    assert evaluate_screening(data) == 'blocked'


def test_injury_gives_warning():
    data = base_answers()
    data['injury'] = 'yes'
    assert evaluate_screening(data) == 'warning'


def test_asthma_gives_warning():
    data = base_answers()
    data['asthma'] = 'yes'
    assert evaluate_screening(data) == 'warning'
