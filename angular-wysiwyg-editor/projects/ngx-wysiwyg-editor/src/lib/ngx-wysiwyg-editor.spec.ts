import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxWysiwygEditor } from './ngx-wysiwyg-editor';

describe('NgxWysiwygEditor', () => {
  let component: NgxWysiwygEditor;
  let fixture: ComponentFixture<NgxWysiwygEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxWysiwygEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxWysiwygEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
