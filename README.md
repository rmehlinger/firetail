# Firetail

This package is a simple integration between the 
[Firebase Database](https://firebase.google.com/docs/database/web/read-and-write) and the 
[Bobtail](https://github.com/bobtail-dev/bobtail) functional reactive programming framework, using
the [bobtail-json-cell extension](https://github.com/bobtail-dev/bobtail-json-cell).

It provides read-only objects which can be bound to a Firebase ref, either as cells 
(which subscribes to the `value` event) or as lists (which subscribe to the `child_added`, `child_removed`, 
and `child_changed` events). Both types come in readonly and read-write variants.

# Demo

# Project Status
This code is in alpha state.

# Acknowledgments

The first version of this was written during Dropbox's July 2017 Hack Week. 