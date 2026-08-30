from app import app


def test_route_analysis_is_stable():
    client = app.test_client()
    one = client.post('/analyze/route', json={'origin': 'ATL', 'destination': 'JFK'}).get_json()['data']
    two = client.post('/analyze/route', json={'origin': 'ATL', 'destination': 'JFK'}).get_json()['data']
    assert one == two
    assert len(one['carrier_breakdown']) == 6
