from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user, require_admin
from backend.app.models.models import Resource, User
from backend.app.schemas.schemas import ResourceResponse, ResourceCreate

router = APIRouter(prefix="/api/resources", tags=["Monitored Resources"])

@router.get("", response_model=List[ResourceResponse])
def list_resources(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Resource)
    if status:
        query = query.filter(Resource.status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

@router.post("", response_model=ResourceResponse)
def create_resource(
    payload: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing = db.query(Resource).filter(Resource.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Resource name already exists")
    
    resource = Resource(
        name=payload.name,
        resource_type=payload.resource_type,
        endpoint_or_path=payload.endpoint_or_path,
        status=payload.status
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource
