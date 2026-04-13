from django.test import SimpleTestCase
from django.urls import reverse


class TestHealthcheckEndpoint(SimpleTestCase):
    def test_healthcheck_returns_ok(self):
        response = self.client.get(reverse('healthcheck'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('status'), 'ok')
