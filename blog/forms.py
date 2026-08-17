from django import forms


class SearchForm(forms.Form):
    """Query for `SearchView` — a single free-text field matched against title and body."""

    q = forms.CharField(
        label="Search",
        required=False,
        widget=forms.TextInput(attrs={"placeholder": "Search articles...", "type": "search"}),
    )
