from app import app


def test_predict_contract():
    client = app.test_client()
    response = client.post('/predict', json={
        'origin': 'ATL', 'destination': 'JFK', 'carrier': 'DL', 'flight_date': '2026-08-25',
        'dep_time': '18:30', 'distance': 760, 'prev_arr_delay': 20, 'taxi_out': 24
    })
    assert response.status_code == 200
    result = response.get_json()['data']
    assert 0 <= result['delay_probability'] <= 100
    assert len(result['shap_explanation']) == 5
