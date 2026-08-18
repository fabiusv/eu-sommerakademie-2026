import json
from datetime import datetime
from typing import Literal

from django.http import Http404
from ninja import Router, Schema
from ninja.responses import Status
from ninja.security import django_auth
from pydantic import Field, field_validator

from config.security import OptionalSessionAuth
from interactions.services import (
    InteractionEvent,
    list_canonical_bookmarks,
    record_interactions,
    remove_bookmark,
    save_bookmark,
)
from opportunities.schemas import OpportunityOut, serialize_opportunity
from opportunities.services import find_opportunity, find_public_opportunity

router = Router(tags=["interactions"])
optional_session_auth = OptionalSessionAuth()


class BookmarkOut(Schema):
    opportunity: OpportunityOut
    created_at: datetime


class BookmarkPage(Schema):
    items: list[BookmarkOut]
    count: int


class InteractionEventIn(Schema):
    opportunity_id: int
    interaction_type: Literal["IMPRESSION", "OPEN", "EXTERNAL_ACTION_CLICK"]
    context: dict[str, object] = Field(default_factory=dict)

    @field_validator("context")
    @classmethod
    def context_is_small(cls, value):
        if len(json.dumps(value, separators=(",", ":"), default=str).encode()) > 4096:
            raise ValueError("interaction context must not exceed 4096 bytes")
        return value


class InteractionBatchIn(Schema):
    events: list[InteractionEventIn] = Field(min_length=1, max_length=100)


class InteractionBatchOut(Schema):
    created: int


@router.get("/bookmarks", auth=django_auth, response=BookmarkPage)
def list_bookmarks(request):
    bookmarks = list_canonical_bookmarks(user=request.user)
    return {
        "items": [
            {
                "opportunity": serialize_opportunity(item.opportunity),
                "created_at": item.bookmark.created_at,
            }
            for item in bookmarks
        ],
        "count": len(bookmarks),
    }


@router.put(
    "/bookmarks/{opportunity_id}",
    auth=django_auth,
    response={200: BookmarkOut, 201: BookmarkOut},
)
def put_bookmark(request, opportunity_id: int):
    opportunity = find_public_opportunity(opportunity_id)
    if opportunity is None:
        raise Http404
    bookmark, created = save_bookmark(user=request.user, opportunity=opportunity)
    body = {
        "opportunity": serialize_opportunity(opportunity),
        "created_at": bookmark.created_at,
    }
    return Status(201 if created else 200, body)


@router.delete("/bookmarks/{opportunity_id}", auth=django_auth, response={204: None})
def delete_bookmark(request, opportunity_id: int):
    opportunity = find_opportunity(opportunity_id)
    if opportunity is None:
        raise Http404
    remove_bookmark(user=request.user, opportunity=opportunity)
    return Status(204, None)


@router.post("/interactions", auth=optional_session_auth, response={201: InteractionBatchOut})
def create_interactions(request, payload: InteractionBatchIn):
    user = request.user if request.user.is_authenticated else None
    created = record_interactions(
        user=user,
        events=[
            InteractionEvent(
                opportunity_id=event.opportunity_id,
                interaction_type=event.interaction_type,
                context=event.context,
            )
            for event in payload.events
        ],
    )
    return Status(201, {"created": created})
