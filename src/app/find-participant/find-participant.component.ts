import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account } from '@app/_models';
import { AccountService } from '@app/_services';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-find-participant',
  templateUrl: './find-participant.component.html',
  styleUrls: ['./find-participant.component.less']
})
export class FindParticipantComponent implements OnInit {

  searchForm: FormGroup;
  participant$: Observable<Account>;
  loading: boolean;
  submitted = false;

  constructor(private fb: FormBuilder, private accountService: AccountService) { 
    this.initForm();
  }

  ngOnInit(): void {
  }

  get f(): { [key: string]: AbstractControl } {
    return this.searchForm.controls;
  }

  submitForm(): void {
    this.submitted = true;

    if (this.searchForm.invalid) return;


    this.loading = true
    this.participant$ = this.accountService
      .getParticipantByEmail(this.searchForm.value?.searchString)
        .pipe(
          catchError(err => of(err)),
          finalize(() => this.loading = false)
        );
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      searchString: [null, [Validators.email, Validators.required]]
    })
  }

}
